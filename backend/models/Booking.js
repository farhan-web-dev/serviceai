const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  serviceType: { type: String, required: true },
  location: { type: String, required: true },
  requestedTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: [
      'Booking Confirmed', 
      'Provider Assigned', 
      'Provider En Route', 
      'Service Started', 
      'Service In Progress', 
      'Service Completed', 
      'Feedback Requested'
    ], 
    default: 'Booking Confirmed' 
  },
  reminderScheduled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
