const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllUnread, clearAllNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.patch('/read', markAsRead);
router.patch('/unread', markAllUnread);
router.delete('/', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
