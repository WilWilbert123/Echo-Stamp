const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    placeId: { type: String, required: true },  
    title: { type: String, required: true },    
    description: { type: String },
    locationName: { type: String },              
    coords: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    category: { type: String },               
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'active' },  
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);