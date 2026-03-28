const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All messaging routes require login

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);

module.exports = router;