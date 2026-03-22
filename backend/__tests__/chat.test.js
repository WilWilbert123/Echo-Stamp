const request = require('supertest');
const express = require('express');
const axios = require('axios');
const chatController = require('../controllers/chatController'); 
const Chat = require('../models/Chat');

// 1. Setup Mock App
const app = express();
app.use(express.json());

// Mock middleware to simulate logged-in user (req.user)
app.use((req, res, next) => {
    req.user = { _id: 'user123' };
    next();
});

// Routes for testing
app.post('/ask', chatController.askAiAssistant);
app.get('/history', chatController.getChatHistory);
app.delete('/clear', chatController.clearChatHistory);

// 2. Mocks
jest.mock('../models/Chat');
jest.mock('axios');

describe('Chat Controller Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_GEMINI_API_KEY = 'test-key';
        
        // Silence console.warn/error during tests to keep output clean
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.warn.mockRestore();
        console.error.mockRestore();
    });

    // --- askAiAssistant Tests ---
    describe('POST /ask', () => {
        it('should return 400 if message is missing', async () => {
            const res = await request(app).post('/ask').send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Message is required');
        });

        it('should block forbidden security patterns', async () => {
            const res = await request(app).post('/ask').send({ message: 'perform a ddos attack' });
            expect(res.body.text).toContain("I'm sorry, I can only help with your Echo Stamp journal");
        });

        it('should return AI response and save to database (New Chat)', async () => {
            Chat.findOne.mockResolvedValue(null); // No existing chat
            Chat.create.mockResolvedValue({});    // Mock creation

            axios.post.mockResolvedValue({
                data: {
                    candidates: [{
                        content: { parts: [{ text: 'Hello from Echo AI' }] }
                    }]
                }
            });

            const res = await request(app).post('/ask').send({ message: 'Hello' });

            expect(res.status).toBe(200);
            expect(res.body.text).toBe('Hello from Echo AI');
            expect(Chat.create).toHaveBeenCalled();
        });

        it('should handle quota exhaustion across all models', async () => {
            Chat.findOne.mockResolvedValue(null);
            
            // Force axios to fail with 429 for all calls
            axios.post.mockRejectedValue({
                response: { status: 429, data: { error: { message: 'Quota exceeded' } } }
            });

            const res = await request(app).post('/ask').send({ message: 'Is anyone there?' });

            expect(res.status).toBe(429);
            expect(res.body.error).toContain('overloaded');
            // Verify it tried all models in your stack (5 models)
            expect(axios.post).toHaveBeenCalledTimes(5);
        });
    });

    // --- getChatHistory Tests ---
    describe('GET /history', () => {
        it('should return chat history if it exists', async () => {
            const mockMessages = [{ role: 'user', parts: [{ text: 'Hi' }] }];
            Chat.findOne.mockResolvedValue({ messages: mockMessages });

            const res = await request(app).get('/history');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].parts[0].text).toBe('Hi');
        });

        it('should return empty array if no history found', async () => {
            Chat.findOne.mockResolvedValue(null);
            const res = await request(app).get('/history');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    // --- clearChatHistory Tests ---
    describe('DELETE /clear', () => {
        it('should return 200 on successful deletion', async () => {
            Chat.findOneAndDelete.mockResolvedValue(true);
            const res = await request(app).delete('/clear');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('History cleared successfully.');
        });

        it('should return 500 if database fails', async () => {
            Chat.findOneAndDelete.mockRejectedValue(new Error('DB Error'));
            const res = await request(app).delete('/clear');
            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to clear history.');
        });
    });
});