const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  category: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  distance: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
