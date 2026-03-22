const request = require('supertest');
const express = require('express');
const eventController = require('../controllers/eventController');  
const Event = require('../models/Event');

const app = express();
app.use(express.json());

// Mock Auth Middleware
app.use((req, res, next) => {
    req.user = { _id: 'user_678' };
    next();
});

app.post('/events', eventController.createEvent);
app.get('/events', eventController.getAllEvents);

jest.mock('../models/Event');

describe('Event Controller Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Create Event Tests ---
    describe('POST /events', () => {
        it('should create a new event successfully', async () => {
            const eventData = {
                title: "Beach Cleanup",
                placeId: "12345",
                coords: { lat: 10, lng: 20 },
                locationName: "Zuma Beach"
            };

            // Mock Event.create to return the data + an ID
            Event.create.mockResolvedValue({ 
                _id: 'event_abc', 
                ...eventData, 
                hostId: 'user_678',
                attendees: ['user_678'] 
            });

            const res = await request(app).post('/events').send(eventData);

            expect(res.status).toBe(201);
            expect(res.body.title).toBe("Beach Cleanup");
            expect(res.body.hostId).toBe('user_678');
            expect(Event.create).toHaveBeenCalledWith(expect.objectContaining({
                title: "Beach Cleanup"
            }));
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app).post('/events').send({ title: "No Coords Here" });
            
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Please provide all required fields");
        });
    });

    // --- Get All Events Tests ---
    describe('GET /events', () => {
        it('should fetch all events with sorting and population', async () => {
            const mockEvents = [
                { title: 'Event 1', hostId: { name: 'John' } },
                { title: 'Event 2', hostId: { name: 'Jane' } }
            ];

            /** * MOCKING CHAINED METHODS: 
             * find() returns an object with sort()
             * sort() returns an object with populate()
             * populate() finally returns the data
             */
            Event.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockEvents)
                })
            });

            const res = await request(app).get('/events');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].title).toBe('Event 1');
            expect(Event.find).toHaveBeenCalled();
        });

        it('should return 500 if database fetch fails', async () => {
            Event.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockRejectedValue(new Error('Database error'))
                })
            });

            const res = await request(app).get('/events');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Failed to fetch community feed");
        });
    });
});