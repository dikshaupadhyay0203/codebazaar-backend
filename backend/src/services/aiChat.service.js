const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

const SYSTEM_PROMPT = `You are CodeBazaar AI Agent, a helpful marketplace assistant.
You help users discover projects, compare tech stacks, pricing, and buying flow.
Keep answers concise, practical, and friendly.
If asked to do something unrelated to marketplace help, respond politely and redirect to CodeBazaar context.`;

const buildFallbackReply = (messages) => {
    const latestMessage = messages[messages.length - 1]?.content || '';
    return `AI provider is not configured yet. You asked: "${latestMessage}".\n\nTo enable full AI chat, set OPENAI_API_KEY (and optional OPENAI_MODEL/OPENAI_BASE_URL) in backend .env and restart the server.`;
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

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const providerMessage = data?.error?.message || 'AI provider request failed';
        throw new ApiError(400, providerMessage);
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
        throw new ApiError(500, 'AI provider returned empty response');
    }

    return {
        provider: 'openai-compatible',
        model: payload.model,
        reply
    };
};

module.exports = { getChatCompletion };
