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