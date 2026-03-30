const express = require('express');
const router = express.Router();
const { createGroup, getGroups, sendGroupMessage, getGroupMessages, deleteGroup, markGroupAsRead } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/message', sendGroupMessage);
router.get('/:groupId', getGroupMessages);
router.delete('/:groupId', deleteGroup);
router.put('/read/:groupId', markGroupAsRead);

module.exports = router;