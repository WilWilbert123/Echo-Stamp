const LocationShare = require('../models/LocationShare');
const User = require('../models/User');

exports.startLiveShare = async (req, res) => {
    try {
        const { recipientIds, durationMinutes = 60 } = req.body;
        const sharerId = req.user._id;

        // Stop any existing active shares for this user first
        await LocationShare.updateMany({ sharer: sharerId }, { isActive: false });

        const expiresAt = new Date(Date.now() + durationMinutes * 60000);
        
        const share = await LocationShare.create({
            sharer: sharerId,
            recipients: recipientIds,
            expiresAt
        });

        res.status(201).json(share);
    } catch (error) {
        res.status(500).json({ message: 'Failed to start live share', error: error.message });
    }
};

exports.stopLiveShare = async (req, res) => {
    try {
        const sharerId = req.user._id;
        await LocationShare.updateMany({ sharer: sharerId }, { isActive: false });
        res.status(200).json({ success: true, message: 'Live sharing stopped' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to stop live share' });
    }
};

exports.updateMyLiveLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            lastKnownLocation: { latitude, longitude, updatedAt: new Date() }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

exports.getActiveSharesForMe = async (req, res) => {
    try {
        const myId = req.user._id;
        // Find shares where I am a recipient and it's still active
        const activeShares = await LocationShare.find({
            recipients: myId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('sharer', 'firstName lastName username profilePicture lastKnownLocation');

        res.status(200).json(activeShares);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active shares' });
    }
};

exports.getMyOutgoingShare = async (req, res) => {
    try {
        const share = await LocationShare.findOne({
            sharer: req.user._id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        // Return the array of recipient IDs
        res.status(200).json(share ? share.recipients : []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your sharing status' });
    }
};