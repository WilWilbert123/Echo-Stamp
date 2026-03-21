const express = require('express');
const router = express.Router();

 
const eventCtrl = require('../controllers/eventController');
const authMid = require('../middleware/authMiddleware');

 
console.log("LOG: Controller methods found:", Object.keys(eventCtrl));
console.log("LOG: Middleware methods found:", Object.keys(authMid));

const { createEvent, getAllEvents } = eventCtrl;
const { protect } = authMid;

 
router.post('/host', protect, createEvent);
router.get('/', protect, getAllEvents);

module.exports = router;