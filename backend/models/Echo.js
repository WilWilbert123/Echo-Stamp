const mongoose = require('mongoose');

const EchoSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  emotion: { 
    type: String, 
    default: 'Neutral' 
  },
  imageUrl: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  collection: 'echos'  
});

module.exports = mongoose.model('Echo', EchoSchema);