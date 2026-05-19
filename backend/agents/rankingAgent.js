const { callGemini } = require('../services/geminiService');
const { rankingPromptTemplate } = require('../prompts/rankingPrompt');
const { logStep } = require('./workflowLoggingAgent');

async function rankProviders(providers, intent) {
  await logStep('Ranking_Start', `Ranking ${providers.length} providers using AI`);

  if (!providers || providers.length === 0) {
      await logStep('Ranking_Skipped', 'No providers to rank');
      return null;
  }

  // Calculate Mathematical Scores
  const scoredProviders = providers.map(p => {
    // Distance (40% weight). Closer is better. Assume 20km is 0 points.
    const distMatch = p.distanceText ? p.distanceText.match(/(\d+(\.\d+)?)/) : null;
    let distVal = distMatch ? parseFloat(distMatch[1]) : 10;
    let dScore = Math.max(0, 100 - (distVal * 5)); // 2km = 90, 20km = 0

    // Rating (40% weight). 5 stars = 100.
    let rScore = (p.rating / 5) * 100;

    // Availability (20% weight). True = 100, False = 0.
    let aScore = p.availability ? 100 : 0;

    let finalScore = (dScore * 0.4) + (rScore * 0.4) + (aScore * 0.2);

    return {
      _id: p._id,
      name: p.name,
      rating: p.rating,
      distanceText: p.distanceText,
      availability: p.availability,
      distanceScore: Math.round(dScore),
      ratingScore: Math.round(rScore),
      availabilityScore: Math.round(aScore),
      finalScore: Math.round(finalScore)
    };
  });

  // Sort by mathematically calculated final score
  scoredProviders.sort((a, b) => b.finalScore - a.finalScore);
  const top3 = scoredProviders.slice(0, 3);

  const prompt = rankingPromptTemplate
    .replace('{serviceType}', intent.serviceType)
    .replace('{location}', intent.location)
    .replace('{requestedTime}', intent.requestedTime)
    .replace('{providersJSON}', JSON.stringify(top3, null, 2));

  try {
    const rankingResult = await callGemini(prompt, true);
    
    if (!rankingResult || !rankingResult.comparisonReasoning) {
        throw new Error("Failed to get valid ranking from Gemini.");
    }

    const explanations = rankingResult.explanations || {};

    // Attach explanations to top 3 and find the winner (index 0 is winner because we mathematically sorted it!)
    const enrichedTop3 = top3.map(p => {
      const fullProviderInfo = providers.find(fullP => fullP._id === p._id);
      return {
        ...fullProviderInfo, // Spread directly since discoveryAgent returns plain objects
        distanceText: fullProviderInfo.distanceText,
        distanceScore: p.distanceScore,
        ratingScore: p.ratingScore,
        availabilityScore: p.availabilityScore,
        finalScore: p.finalScore,
        explanation: explanations[p._id.toString()] || "Mathematically scored as a top option."
      };
    });

    const selectedProvider = enrichedTop3[0];

    await logStep('Ranking_Success', `AI selected provider: ${selectedProvider?.name || 'Unknown'}`, { 
        selectedId: selectedProvider._id,
        reasoning: rankingResult.comparisonReasoning 
    });

    return {
        provider: selectedProvider,
        reasoning: rankingResult.comparisonReasoning,
        matchConfidenceScore: rankingResult.matchConfidenceScore,
        rankingConfidenceScore: rankingResult.rankingConfidenceScore,
        topProviders: enrichedTop3,
        decisionPanel: {
            selectedReason: rankingResult.selectedProviderReason || "closest + highest rating + available",
            rejectedReasons: rankingResult.rejectedProvidersReasons || []
        }
    };
  } catch (error) {
    await logStep('Ranking_Error', 'AI ranking failed, using fallback', { error: error.message });
    
    const enrichedTop3 = top3.map((p, idx) => {
      const fullProviderInfo = providers.find(fullP => fullP._id === p._id);
      return {
        ...fullProviderInfo, // Spread directly since discoveryAgent returns plain objects
        distanceText: fullProviderInfo.distanceText,
        distanceScore: p.distanceScore,
        ratingScore: p.ratingScore,
        availabilityScore: p.availabilityScore,
        finalScore: p.finalScore,
        explanation: idx === 0 ? "Highest mathematical score." : "Mathematically scored runner-up."
      };
    });

    return {
        provider: enrichedTop3[0],
        reasoning: "Fallback selection based on highest calculated score due to AI timeout.",
        matchConfidenceScore: 70,
        rankingConfidenceScore: 70,
        topProviders: enrichedTop3,
        decisionPanel: {
            selectedReason: "highest mathematical score",
            rejectedReasons: enrichedTop3.slice(1).map(p => ({ name: p.name, reason: "lower mathematical score" }))
        }
    };
  }
}

module.exports = {
  rankProviders
};
