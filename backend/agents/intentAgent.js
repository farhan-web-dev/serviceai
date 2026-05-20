const { callGemini } = require('../services/geminiService');
const { intentPromptTemplate } = require('../prompts/intentPrompt');
const { logStep } = require('./workflowLoggingAgent');

// Keyword-based fallback parser — works without Gemini
function parseIntentLocally(query) {
  const q = query.toLowerCase();

  // --- Service Type Detection ---
  const serviceKeywords = {
    'AC Technician': ['ac', 'air condition', 'cooling', 'technician', 'ٹیکنیشن', 'ac technician'],
    'Plumber':       ['plumber', 'plumbing', 'pipe', 'leakage', 'water', 'پلمبر'],
    'Electrician':   ['electrician', 'electric', 'wiring', 'light', 'power', 'الیکٹریشن'],
    'Beautician':    ['beautician', 'beauty', 'salon', 'makeup', 'facial', 'بیوٹیشن'],
    'Tutor':         ['tutor', 'teacher', 'teach', 'math', 'science', 'study', 'education'],
  };

  let serviceType = 'Unknown';
  for (const [type, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(kw => q.includes(kw))) {
      serviceType = type;
      break;
    }
  }

  // --- Location Detection ---
  const locationKeywords = [
    'G-13', 'G-11', 'G-10', 'G-9', 'G-8', 'G-7', 'G-6',
    'F-10', 'F-11', 'F-8', 'F-7', 'F-6',
    'I-8', 'I-9', 'I-10',
    'E-7', 'E-8', 'E-11',
    'Blue Area', 'Bahria', 'DHA', 'Gulberg', 'Rawalpindi', 'Islamabad'
  ];
  let location = 'Unknown';
  for (const loc of locationKeywords) {
    if (q.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  // --- Time Detection ---
  let requestedTime = 'As soon as possible';
  if (q.includes('kal') || q.includes('tomorrow') || q.includes('next day')) {
    requestedTime = 'Tomorrow';
  } else if (q.includes('subah') || q.includes('morning')) {
    requestedTime = q.includes('kal') ? 'Tomorrow Morning' : 'This Morning';
  } else if (q.includes('sham') || q.includes('evening') || q.includes('shaam')) {
    requestedTime = 'This Evening';
  } else if (q.includes('raat') || q.includes('night')) {
    requestedTime = 'Tonight';
  } else if (q.includes('aaj') || q.includes('today')) {
    requestedTime = 'Today';
  }

  return {
    serviceType,
    location,
    requestedTime,
    confidenceScore: serviceType !== 'Unknown' ? 70 : 40,
    confidenceReasoning: 'Parsed using local keyword matching (Gemini fallback)',
  };
}

async function extractIntent(userQuery) {
  await logStep('IntentExtraction_Start', `Analyzing user query: "${userQuery}"`, { query: userQuery });
  
  const prompt = intentPromptTemplate.replace('{query}', userQuery);
  
  try {
    const extractedData = await callGemini(prompt, true);
    
    if (!extractedData) {
      throw new Error("Failed to parse intent from Gemini response.");
    }

    await logStep('IntentExtraction_Success', 'Successfully extracted intent using Gemini AI', extractedData);
    return extractedData;
  } catch (error) {
    await logStep('IntentExtraction_Fallback', 'Gemini unavailable — using local keyword parser', { error: error.message });
    
    // Smart fallback: parse the query locally instead of returning 'Unknown'
    const fallback = parseIntentLocally(userQuery);
    await logStep('IntentExtraction_FallbackResult', `Local parser extracted: ${fallback.serviceType} @ ${fallback.location}`, fallback);
    return fallback;
  }
}

module.exports = {
  extractIntent
};
