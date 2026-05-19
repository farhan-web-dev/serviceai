const Booking = require('../models/Booking');
const { logStep } = require('./workflowLoggingAgent');

async function simulateLifecycle(bookingId) {
    const steps = [
      'Provider Assigned',
      'Provider En Route',
      'Service Started',
      'Service In Progress',
      'Service Completed',
      'Feedback Requested'
    ];
    
    for (const step of steps) {
        // Wait 5 seconds between steps for real-time demo purposes
        await new Promise(res => setTimeout(res, 5000));
        
        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) break;
            
            booking.status = step;
            await booking.save();
            
            await logStep('Lifecycle_Update', `Service status updated to: ${step}`, { bookingId: booking._id, status: step });
        } catch (e) {
            console.error('[AGENT: Lifecycle] simulation error', e);
        }
    }
}

async function scheduleFollowUp(booking) {
  await logStep('FollowUp_Start', `Initiating live lifecycle simulation for booking ${booking._id}`);

  try {
    booking.reminderScheduled = true;
    await booking.save();

    // Fire and forget the background simulation
    simulateLifecycle(booking._id);

    const followUpDetails = {
        message: `Service lifecycle tracking initiated. Follow live updates on the timeline.`,
        status: 'Tracking Active'
    };

    await logStep('FollowUp_Success', 'Lifecycle tracking successfully started', followUpDetails);
    return followUpDetails;
  } catch (error) {
    await logStep('FollowUp_Error', 'Failed to start tracking', { error: error.message });
    return {
        message: 'Could not start tracking.',
        status: 'Failed'
    };
  }
}

module.exports = {
  scheduleFollowUp
};
