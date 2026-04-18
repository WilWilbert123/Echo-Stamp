const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ai-assistant', protect, chatController.askAiAssistant);
router.delete('/history', protect, chatController.clearChatHistory);
router.get('/history', protect, chatController.getChatHistory);

module.exports = router;