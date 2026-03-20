// 1. SET TEST ENVIRONMENT VARIABLES (Prevents crashes without .env)
process.env.JWT_SECRET = 'test_secret_for_echo_stamp';
process.env.RESEND_API_KEY = 're_test_123456789'; 

// 2. MOCK EXTERNAL SERVICES (Prevents real emails from being sent)
jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ 
                    data: { id: 'mock_email_id' }, 
                    error: null 
                }),
            },
        })),
    };
});

// 3. IMPORTS
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const { forgotPasswordRequest, resetPassword } = require('../controllers/userController');  
const User = require('../models/User');
const OtpEntry = require('../models/OtpEntry');

// 4. TEST APP SETUP
const app = express();
app.use(express.json());
app.post('/api/users/forgot-password', forgotPasswordRequest);
app.post('/api/users/reset-password', resetPassword);

let mongoServer;

// 5. DATABASE LIFECYCLE
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// 6. TEST SUITE
describe('Forgot/Reset Password Integration', () => {
    
    // Seed a fresh user before every single test
    beforeEach(async () => {
        await User.deleteMany({});
        await OtpEntry.deleteMany({});
        await User.create({
            firstName: "John",
            lastName: "Wilbert",
            username: "johngamis",
            email: "test@echostamp.online",
            password: "OldPassword123"
        });
    });

    it('should create an OTP entry when forgot password is requested', async () => {
        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: "test@echostamp.online" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Reset code sent');

        // Verify OTP was actually saved in the "fake" memory DB
        const otpRecord = await OtpEntry.findOne({ email: "test@echostamp.online" });
        expect(otpRecord).toBeDefined();
        expect(otpRecord.otp).toHaveLength(6);
    });

    it('should successfully reset password with a valid OTP', async () => {
        const testOtp = "123456";
        // Simulate the OTP already existing in DB
        await OtpEntry.create({
            email: "test@echostamp.online",
            otp: testOtp,
            createdAt: new Date()
        });

        const res = await request(app)
            .post('/api/users/reset-password')
            .send({
                email: "test@echostamp.online",
                otp: testOtp,
                newPassword: "NewButterySmoothPassword123"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Password reset successful');

        // Verify the User's password was updated and hashed correctly
        const updatedUser = await User.findOne({ email: "test@echostamp.online" });
        const isMatch = await updatedUser.matchPassword("NewButterySmoothPassword123");
        expect(isMatch).toBe(true);
    });

    it('should return 400 for an invalid OTP', async () => {
        const res = await request(app)
            .post('/api/users/reset-password')
            .send({
                email: "test@echostamp.online",
                otp: "000000", 
                newPassword: "SomePassword123"
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Invalid code');
    });
});