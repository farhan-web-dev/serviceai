const { callGemini } = require('../services/geminiService');
const { intentPromptTemplate } = require('../prompts/intentPrompt');
const { logStep } = require('./workflowLoggingAgent');

async function extractIntent(userQuery) {
  await logStep('IntentExtraction_Start', \`Analyzing user query: "\${userQuery}"\`, { query: userQuery });
  
  const prompt = intentPromptTemplate.replace('{query}', userQuery);
  
  try {
    const extractedData = await callGemini(prompt, true);
    
    if (!extractedData) {
        throw new Error("Failed to parse intent from Gemini response.");
    }

    await logStep('IntentExtraction_Success', 'Successfully extracted intent from query', extractedData);
    return extractedData;
  } catch (error) {
    await logStep('IntentExtraction_Error', 'Failed to extract intent', { error: error.message });
    // Fallback logic for hackathon
    return {
      serviceType: 'Unknown',
      location: 'Unknown',
      requestedTime: 'As soon as possible'
    };
  }
}

module.exports = {
  extractIntent
};
