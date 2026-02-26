const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

const SYSTEM_PROMPT = `You are CodeBazaar AI Agent, a helpful marketplace assistant.
You help users discover projects, compare tech stacks, pricing, and buying flow.
Keep answers concise, practical, and friendly.
If asked to do something unrelated to marketplace help, respond politely and redirect to CodeBazaar context.`;

const isGreeting = (text) => /^(hi|hii+|hello+|hey+|yo+|good\s*(morning|afternoon|evening))\b/i.test(text);

const buildQuickAssistReply = (messages) => {
    const latestMessage = (messages[messages.length - 1]?.content || '').trim();

    if (!latestMessage) {
        return 'I can help you choose a project based on stack, budget, and rating. Tell me what you need.';
    }

    if (isGreeting(latestMessage)) {
        return 'Hi! I am CodeBazaar Assistant. Tell me your budget, preferred tech stack, and use case, and I will suggest the best project options.';
    }

    return 'I can still help right now. Share your target stack, budget range, and project type, and I will suggest what to buy and what to avoid.';
};

const buildFallbackReply = (messages) => {
    return buildQuickAssistReply(messages);
};

const buildProviderFailureReply = (messages) => {
    return buildQuickAssistReply(messages);
};

const getChatCompletion = async ({ messages }) => {
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, 'messages must be a non-empty array');
    }

    const normalizedMessages = messages
        .map((item) => ({
            role: item.role,
            content: String(item.content || '').trim()
        }))
        .filter((item) => ['user', 'assistant', 'system'].includes(item.role) && item.content.length > 0)
        .slice(-12);

    if (!normalizedMessages.length) {
        throw new ApiError(400, 'No valid messages provided');
    }

    if (!env.OPENAI_API_KEY) {
        return {
            provider: 'fallback',
            model: 'none',
            reply: buildFallbackReply(normalizedMessages)
        };
    }

    const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const payload = {
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...normalizedMessages],
        temperature: 0.4,
        max_tokens: 400
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                provider: 'fallback',
                model: payload.model,
                reply: buildProviderFailureReply(normalizedMessages)
            };
        }

        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return {
                provider: 'fallback',
                model: payload.model,
                reply: buildProviderFailureReply(normalizedMessages)
            };
        }

        return {
            provider: 'openai-compatible',
            model: payload.model,
            reply
        };
    } catch {
        return {
            provider: 'fallback',
            model: payload.model,
            reply: buildProviderFailureReply(normalizedMessages)
        };
    } finally {
        clearTimeout(timeout);
    }
};

module.exports = { getChatCompletion };
