const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Import controller and model
const { getEchoes, createEcho, deleteEcho } = require('../controllers/echoController');
const Echo = require('../models/Echo');

// Create a mini-app for testing the Echo routes
const app = express();
app.use(express.json());
app.get('/api/echoes/:userId/:type', getEchoes);
app.post('/api/echoes', createEcho);
app.delete('/api/echoes/:id', deleteEcho);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Echo Integration Tests', () => {
    // Generate a valid-looking ID string for the userId
    const validUserId = new mongoose.Types.ObjectId().toString();

    beforeEach(async () => {
        // Clear the collection before each test to ensure isolation
        await Echo.deleteMany({});
    });

    it('should create a new echo and default to "mood" if type is missing', async () => {
        const echoData = {
            userId: validUserId,
            title: "Morning Vibe",
            description: "Feeling great after the morning run.",
            emotion: "Happy"
            // 'type' is missing, but our controller defaults it to 'mood'
        };

        const res = await request(app)
            .post('/api/echoes')
            .send(echoData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.type).toBe('mood');
        expect(res.body.title).toBe("Morning Vibe");
        
        // Verify it exists in the database
        const dbEcho = await Echo.findById(res.body._id);
        expect(dbEcho).toBeDefined();
        expect(dbEcho.userId).toBe(validUserId);
    });

    it('should only fetch echoes for a specific user and type', async () => {
        // Seed data using only allowed enum values ('mood')
        // We use different titles to distinguish them
        await Echo.create([
            { userId: validUserId, title: "User Mood 1", type: "mood", emotion: "Calm" },
            { userId: validUserId, title: "User Mood 2", type: "mood", emotion: "Excited" },
            { userId: "different_user_id", title: "Other User Mood", type: "mood" }
        ]);

        const res = await request(app)
            .get(`/api/echoes/${validUserId}/mood`);

        expect(res.statusCode).toEqual(200);
        // Should find 2 items for validUserId, but exclude the "different_user_id"
        expect(res.body).toHaveLength(2);
        expect(res.body[0].userId).toBe(validUserId);
    });

    it('should successfully delete an existing echo', async () => {
        const echo = await Echo.create({
            userId: validUserId,
            title: "Temporary Echo",
            type: "mood"
        });

        const res = await request(app).delete(`/api/echoes/${echo._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Deleted successfully");
        expect(res.body.id).toBe(echo._id.toString());

        // Verify it was actually removed from the DB
        const checkDb = await Echo.findById(echo._id);
        expect(checkDb).toBeNull();
    });

    it('should return 400 when creating an echo with an invalid type', async () => {
        const invalidData = {
            userId: validUserId,
            title: "Invalid Type Test",
            type: "memory" // 'memory' is NOT in your schema enum: ['mood']
        };

        const res = await request(app)
            .post('/api/echoes')
            .send(invalidData);

        expect(res.statusCode).toEqual(400);
        // Mongoose validation error message usually contains "is not a valid enum value"
        expect(res.body.message).toContain('is not a valid enum value');
    });
});