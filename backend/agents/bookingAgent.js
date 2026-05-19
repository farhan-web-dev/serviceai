const Booking = require('../models/Booking');
const { logStep } = require('./workflowLoggingAgent');
const { callGemini } = require('../services/geminiService');

async function createBooking(provider, intent) {
  await logStep('Booking_Start', `Simulating booking with ${provider.name}`);

  try {
    // Generate Booking Confidence Score using Gemini
    const prompt = `Evaluate this service booking and provide a confidence score (0-100) on how likely it is to be successfully completed based on the provider's rating, availability, and the request details.
    Provider Rating: ${provider.rating}
    Provider Availability: ${provider.availability}
    Service Requested: ${intent.serviceType}
    Time: ${intent.requestedTime}

    Return ONLY a JSON object:
    { "bookingConfidenceScore": "number (0-100)", "bookingReasoning": "string" }`;

    let confidenceScore = 85; // Default
    try {
       const aiEval = await callGemini(prompt, true);
       if (aiEval && aiEval.bookingConfidenceScore) {
           confidenceScore = aiEval.bookingConfidenceScore;
       }
    } catch(e) {
       console.error("Gemini booking eval failed", e);
    }

    const booking = new Booking({
      providerId: provider._id,
      serviceType: intent.serviceType || provider.category,
      location: intent.location,
      requestedTime: intent.requestedTime,
      status: 'Booking Confirmed',
      reminderScheduled: false
    });

    await booking.save();
    
    // Attach confidence score dynamically (not saved to DB to keep schema clean, but returned to UI)
    booking._doc.confidenceScore = confidenceScore;
    
    await logStep('Booking_Success', `Booking confirmed for ${provider.name} with ${confidenceScore}% confidence`, { bookingId: booking._id, confidenceScore });
    return booking;
  } catch (error) {
    await logStep('Booking_Error', 'Failed to save booking', { error: error.message });
    throw error;
  }
}

module.exports = {
  createBooking
};
