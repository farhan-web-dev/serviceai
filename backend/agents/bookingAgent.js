const Booking = require('../models/Booking');
const { logStep } = require('./workflowLoggingAgent');

async function createBooking(provider, intent) {
  await logStep('Booking_Start', \`Simulating booking with \${provider.name}\`);

  try {
    const booking = new Booking({
      providerId: provider._id,
      serviceType: intent.serviceType || provider.category,
      location: intent.location,
      requestedTime: intent.requestedTime,
      status: 'confirmed',
      reminderScheduled: false
    });

    await booking.save();
    
    await logStep('Booking_Success', \`Booking confirmed for \${provider.name}\`, { bookingId: booking._id });
    return booking;
  } catch (error) {
    await logStep('Booking_Error', 'Failed to save booking', { error: error.message });
    throw error;
  }
}

module.exports = {
  createBooking
};
