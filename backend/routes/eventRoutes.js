const express = require('express');
const router = express.Router();
 
const { createEvent, getAllEvents } = require('../controllers/eventController'); 
const { protect } = require('../middleware/authMiddleware');

router.post('/host', protect, createEvent);

 
router.get('/', protect, getAllEvents); 

module.exports = router;