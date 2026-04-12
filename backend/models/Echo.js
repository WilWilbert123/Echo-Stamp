const mongoose = require('mongoose');

const EchoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  type: {
    type: String,
    enum: [ 'mood'], 
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  location: {
    address: String  
  },
  emotion: { 
    type: String, 
    default: 'Neutral' 
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    profilePicture: String,
    text: { type: String, required: true },
    replies: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      profilePicture: String,
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  collection: 'echos'  
});

module.exports = mongoose.model('Echo', EchoSchema);