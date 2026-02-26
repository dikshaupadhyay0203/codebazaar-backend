const { getRedisClient } = require('../config/redis');

const cacheResponse = (ttlSeconds = 60) => async (req, res, next) => {
    const redis = getRedisClient();

    if (!redis) {
        return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;
    const cachedValue = await redis.get(cacheKey);

    if (cachedValue) {
        return res.status(200).json(JSON.parse(cachedValue));
    }

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
        await redis.setEx(cacheKey, ttlSeconds, JSON.stringify(body));
        return originalJson(body);
    };

    return next();
};

module.exports = { cacheResponse };
