const Group = require('../models/Group');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Reuse the push notification logic
const axios = require('axios');

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        const pathAfterUpload = parts.slice(uploadIndex + 2).join('/'); 
        return pathAfterUpload.split('.')[0]; 
    } catch (error) {
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return;

    const isVideo = url.includes('/video/upload/');
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
    } catch (err) {
        console.error(`[Cloudinary] Delete failed for ${publicId}:`, err.message);
    }
};

const sendPushNotification = async (expoPushToken, title, body, data) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        android: { 
            channelId: 'default',
            priority: 'high'
        },
        priority: 'high',
        data: data,
    };
    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Push Notification Error:", error.message);
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { participants, groupName } = req.body;
        const adminId = req.user._id;

        if (!participants || participants.length < 2 || !groupName) {
            return res.status(400).json({ message: 'Group needs a name and at least 2 members' });
        }

        const group = await Group.create({
            name: groupName,
            admin: adminId,
            participants: [...participants, adminId],
            messages: []
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ participants: req.user._id })
            .populate('participants', 'firstName lastName username profilePicture')
            .sort({ updatedAt: -1 });
        
        const groupList = groups.map(g => {
            const lastMsg = g.messages[g.messages.length - 1];
            // Count messages where I am not the sender AND I am not in the seenBy array
            const unreadCount = g.messages.filter(m => 
                m.sender.toString() !== req.user._id.toString() && 
                !m.seenBy?.some(id => id.toString() === req.user._id.toString())
            ).length;
            return {
                _id: g._id,
                isGroup: true,
                groupName: g.name,
                lastMessage: lastMsg ? lastMsg.content : "Group created",
                lastMessageTime: lastMsg ? lastMsg.createdAt : g.updatedAt,
                groupAdmin: g.admin,
                participants: g.participants,
                unreadCount
            };
        });
        res.status(200).json(groupList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
};

exports.sendGroupMessage = async (req, res) => {
    try {
        const { groupId, content, voiceUrl, duration, media } = req.body;
        const senderId = req.user._id;
        const senderName = req.user.firstName || "Someone";

        const group = await Group.findOne({ _id: groupId, participants: senderId });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const newMessage = { sender: senderId, senderName, content, voiceUrl, duration, media, seenBy: [senderId] };
        group.messages.push(newMessage);
        await group.save();

        const savedMsg = group.messages[group.messages.length - 1];

        // Notify others
        const others = group.participants.filter(p => p.toString() !== senderId.toString());
        const users = await User.find({ _id: { $in: others } });
        users.forEach(u => {
            if (u.pushToken && u.notificationsEnabled) {
                // Better notification text for media
                const notificationBody = (media && media.length > 0) 
                    ? `Sent ${media.length > 1 ? 'photos' : 'a photo'}` 
                    : content;
                sendPushNotification(u.pushToken, `${group.name}: ${senderName}`, notificationBody, { groupId });
            }
        });

        res.status(201).json(savedMsg);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { groupId } = req.params;

        // Automatically mark as read when fetching history
        await Group.updateOne(
            { _id: groupId, participants: myId },
            { $addToSet: { "messages.$[msg].seenBy": myId } },
            { 
                arrayFilters: [{ "msg.sender": { $ne: myId } }], 
                multi: true,
                timestamps: false 
            }
        );

        const group = await Group.findOne({ _id: req.params.groupId, participants: req.user._id })
            .populate('messages.sender', 'firstName lastName');
            
        res.status(200).json(group ? group.messages : []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findOne({ _id: req.params.groupId, admin: req.user._id });
        if (!group) return res.status(403).json({ message: "Unauthorized or Group not found" });

        // Cleanup all media in the group
        for (const message of group.messages) {
            if (message.voiceUrl) await deleteFromCloudinary(message.voiceUrl);
            if (message.media && message.media.length > 0) {
                await Promise.all(message.media.map(m => deleteFromCloudinary(m.url)));
            }
        }

        await Group.findByIdAndDelete(req.params.groupId);
        res.status(200).json({ message: "Group deleted" });
    } catch (error) {
        console.error("Delete Group Error:", error);
        res.status(500).json({ message: 'Error deleting group' });
    }
};

exports.markGroupAsRead = async (req, res) => {
    try {
        const myId = req.user._id;
        const { groupId } = req.params;

        await Group.updateOne(
            { _id: groupId, participants: myId },
            { $addToSet: { "messages.$[msg].seenBy": myId } },
            { 
                arrayFilters: [{ "msg.sender": { $ne: myId } }], 
                multi: true,
                timestamps: false 
            }
        );

        res.status(200).json({ message: "Group messages marked as read" });
    } catch (error) {
        res.status(500).json({ message: 'Error marking group as read' });
    }
};

exports.deleteGroupMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const myId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const message = group.messages.id(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Security: Only the sender can delete their message
        if (message.sender.toString() !== myId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Cleanup Cloudinary storage
        if (message.voiceUrl) await deleteFromCloudinary(message.voiceUrl);
        if (message.media && message.media.length > 0) {
            await Promise.all(message.media.map(m => deleteFromCloudinary(m.url)));
        }

        group.messages.pull(messageId);
        await group.save();
        res.status(200).json({ message: "Deleted", messageId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message' });
    }
};

exports.editGroupMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const { content } = req.body;
        const myId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const message = group.messages.id(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Security: Only sender can edit
        if (message.sender.toString() !== myId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        message.content = content;
        message.isEdited = true;
        await group.save();

        await group.populate('messages.sender', 'firstName lastName');
        const updatedMessage = group.messages.id(messageId);
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error editing group message' });
    }
};