const { callGemini } = require('../services/geminiService');
const { rankingPromptTemplate } = require('../prompts/rankingPrompt');
const { logStep } = require('./workflowLoggingAgent');

async function rankProviders(providers, intent) {
  await logStep('Ranking_Start', \`Ranking \${providers.length} providers using AI\`);

  if (!providers || providers.length === 0) {
      await logStep('Ranking_Skipped', 'No providers to rank');
      return null;
  }

  // Optimize JSON payload to reduce tokens
  const minimalProviders = providers.map(p => ({
    _id: p._id,
    category: p.category,
    rating: p.rating,
    distanceText: p.distanceText
  }));

  const prompt = rankingPromptTemplate
    .replace('{serviceType}', intent.serviceType)
    .replace('{location}', intent.location)
    .replace('{requestedTime}', intent.requestedTime)
    .replace('{providersJSON}', JSON.stringify(minimalProviders, null, 2));

  try {
    const rankingResult = await callGemini(prompt, true);
    
    if (!rankingResult || !rankingResult.selectedProviderId) {
        throw new Error("Failed to get valid ranking from Gemini.");
    }

    const selectedProvider = providers.find(p => p._id.toString() === rankingResult.selectedProviderId.toString());

    await logStep('Ranking_Success', \`AI selected provider: \${selectedProvider?.name || 'Unknown'}\`, { 
        selectedId: rankingResult.selectedProviderId,
        reasoning: rankingResult.reasoning 
    });

    return {
        provider: selectedProvider,
        reasoning: rankingResult.reasoning
    };
  } catch (error) {
    await logStep('Ranking_Error', 'AI ranking failed, using fallback', { error: error.message });
    // Fallback: Pick highest rated, or closest
    const fallbackProvider = providers.sort((a, b) => b.rating - a.rating)[0];
    return {
        provider: fallbackProvider,
        reasoning: "Fallback selection based on highest rating due to AI ranking timeout."
    };
  }
}

module.exports = {
  rankProviders
};
