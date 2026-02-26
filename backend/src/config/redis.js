const { createClient } = require('redis');
const { env } = require('./env');

let redisClient;

const connectRedis = async () => {
    if (!env.REDIS_URL) {
        redisClient = null;
        return null;
    }

    try {
        redisClient = createClient({ url: env.REDIS_URL });
        redisClient.on('error', (error) => console.error('Redis Client Error:', error.message));

        await redisClient.connect();
        console.log('Redis connected');
        return redisClient;
    } catch (error) {
        console.error('Redis unavailable, caching disabled:', error.message);
        redisClient = null;
        return null;
    }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
