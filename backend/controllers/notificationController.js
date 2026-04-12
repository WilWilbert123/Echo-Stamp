const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username firstName lastName profilePicture')
            .populate('journalId', 'title')
            .populate('echoId', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

exports.markAllUnread = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: true },
            { $set: { isRead: false } }
        );
        res.status(200).json({ message: 'All notifications marked as unread' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

exports.clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.status(200).json({ message: 'Notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing notifications' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
};
