const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, editMessage, deleteMessage, deleteConversation, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);  

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.delete('/conversations/:otherUserId', deleteConversation);
router.put('/read/:otherUserId', markAsRead);  
router.get('/:userId', getMessages);
router.patch('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;