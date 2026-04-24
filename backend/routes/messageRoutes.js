const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, editMessage, deleteMessage, deleteConversation, markAsRead, addReaction, removeReaction, getReactions} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);  

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.delete('/conversations/:otherUserId', deleteConversation);
router.put('/read/:otherUserId', markAsRead);  
router.get('/:userId', getMessages);
router.patch('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/reactions/:messageId', addReaction);
router.delete('/reactions/:messageId', removeReaction);
router.get('/reactions/:messageId', getReactions);

module.exports = router;