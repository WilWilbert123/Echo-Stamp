const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  media: [{ type: String }], // Array of URIs (Images/Videos)
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: "Pinned Location" } 
  }
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);