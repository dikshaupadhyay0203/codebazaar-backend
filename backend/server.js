const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { env } = require('./src/config/env');
const { connectRedis } = require('./src/config/redis');

const server = http.createServer(app);

const startServer = async () => {
    await connectDB();
    await connectRedis();

    server.listen(env.PORT, () => {
        console.log(`CodeBazaar API running on port ${env.PORT}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
