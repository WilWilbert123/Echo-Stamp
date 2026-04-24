const express = require('express');
const router = express.Router();
const { createGroup, getGroups, sendGroupMessage, getGroupMessages, deleteGroup, markGroupAsRead, deleteGroupMessage, editGroupMessage, addGroupMessageReaction, removeGroupMessageReaction  } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/message', sendGroupMessage);
router.get('/:groupId', getGroupMessages);
router.delete('/:groupId', deleteGroup);
router.put('/read/:groupId', markGroupAsRead);
router.delete('/:groupId/message/:messageId', deleteGroupMessage);
router.patch('/:groupId/message/:messageId', editGroupMessage);
router.post('/:groupId/message/:messageId/reaction', addGroupMessageReaction);
router.delete('/:groupId/message/:messageId/reaction', removeGroupMessageReaction);
module.exports = router;