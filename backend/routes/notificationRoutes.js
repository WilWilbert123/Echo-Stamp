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
router.patch('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});
module.exports = router;
