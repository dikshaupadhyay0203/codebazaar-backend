const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

const User = require('../../src/models/User');
const authService = require('../../src/services/auth.service');

let mongoServer;

describe('Auth Service', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    test('registerUser should create a user and return token', async () => {
        const result = await authService.registerUser({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Strong@1234',
            role: 'user'
        });

        expect(result.user.email).toBe('test@example.com');
        expect(result.accessToken).toBeDefined();
    });

    test('loginUser should return token for valid credentials', async () => {
        await authService.registerUser({
            name: 'Login User',
            email: 'login@example.com',
            password: 'Strong@1234',
            role: 'creator'
        });

        const login = await authService.loginUser({ email: 'login@example.com', password: 'Strong@1234' });
        expect(login.user.role).toBe('creator');
        expect(login.accessToken).toBeDefined();
    });
});
