const { createClient } = require('redis');
const { env } = require('./env');

let redisClient;

const connectRedis = async () => {
    if (!env.REDIS_URL) {
        console.warn('REDIS_URL missing, caching disabled');
        return null;
    }

    redisClient = createClient({ url: env.REDIS_URL });
    redisClient.on('error', (error) => console.error('Redis Client Error:', error.message));

    await redisClient.connect();
    console.log('Redis connected');
    return redisClient;
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
