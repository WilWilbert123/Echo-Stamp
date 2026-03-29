const Event = require('../models/Event');

 
exports.createEvent = async (req, res) => {
    try {
        const { title, placeId, locationName, coords, image, organizer } = req.body;

       
        if (!title || !placeId || !coords) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const newEvent = await Event.create({
            hostId: req.user._id,  
            title,
            placeId,
            locationName,
            coords,
            image,
            organizer,
            attendees: [req.user._id]  
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

 
exports.getAllEvents = async (req, res) => {
    try {
    
        const events = await Event.find()
            .sort({ createdAt: -1 })  
            .populate('hostId', 'username profilePicture')
            .populate('attendees', 'username profilePicture');  

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to fetch community feed", 
            error: error.message 
        });
    }
};

exports.joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const isAttending = event.attendees.includes(req.user._id);
        
        if (isAttending) {
            // Leave event
            event.attendees.pull(req.user._id);
        } else {
            // Join event
            event.attendees.addToSet(req.user._id);
        }

        await event.save();
        const updatedEvent = await Event.findById(req.params.id)
            .populate('hostId', 'username profilePicture')
            .populate('attendees', 'username profilePicture');

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: "Error joining event", error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.hostId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this event" });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Event deleted", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};