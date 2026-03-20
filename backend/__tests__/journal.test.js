// 1. MOCK CLOUDINARY
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
        },
    },
}));

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cloudinary = require('cloudinary').v2;

const { createJournal, getJournals, deleteJournal } = require('../controllers/journalController');
const Journal = require('../models/Journal');

const app = express();
app.use(express.json());
app.get('/api/journals/:userId', getJournals);
app.post('/api/journals', createJournal);
app.delete('/api/journals/:id', deleteJournal);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Journal Integration Tests', () => {
    
    // Generate a valid MongoDB ID for tests
    const validUserId = new mongoose.Types.ObjectId().toString();

    beforeEach(async () => {
        await Journal.deleteMany({});
        jest.clearAllMocks();
    });

    it('should create a journal entry successfully', async () => {
        const journalData = {
            userId: validUserId, // Use valid ObjectId
            title: "My First Echo",
            content: "Testing the journal system.",
            location: { lat: 14.5995, lng: 120.9842 }, // Added required location
            media: ["https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg"]
        };

        const res = await request(app)
            .post('/api/journals')
            .send(journalData);

        // If this still fails with 400, check res.body.message to see which field is missing!
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe("My First Echo");
    });

    it('should delete a journal and call Cloudinary destroy', async () => {
        const journal = await Journal.create({
            userId: validUserId,
            title: "Delete Me",
            location: { lat: 0, lng: 0 }, // Added required location
            media: ["https://res.cloudinary.com/demo/image/upload/v1234/test_image.jpg"]
        });

        const res = await request(app).delete(`/api/journals/${journal._id}`);

        expect(res.statusCode).toEqual(200);
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
            'test_image', 
            expect.objectContaining({ resource_type: 'image' })
        );
    });
});