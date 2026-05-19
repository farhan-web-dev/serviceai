const { extractIntent } = require('../agents/intentAgent');
const { discoverProviders } = require('../agents/discoveryAgent');
const { rankProviders } = require('../agents/rankingAgent');
const { createBooking } = require('../agents/bookingAgent');
const { scheduleFollowUp } = require('../agents/followUpAgent');
const { logStep } = require('../agents/workflowLoggingAgent');
const WorkflowLog = require('../models/WorkflowLog');

async function orchestrateWorkflow(userQuery) {
  const sessionId = new Date().getTime().toString(); 

  await logStep('Antigravity_Orchestrator_Init', `[Google Antigravity Brain] Taking control of user request: "${userQuery}"`, { sessionId });

  try {
    // 0. Planning Phase
    await logStep('Antigravity_Planning', `[Google Antigravity Brain] Formulating execution plan: Intent -> Discovery -> Ranking -> Booking -> FollowUp`, { strategy: 'Sequential Agent Pipeline' });

    // 1. Intent Extraction Agent
    const intent = await extractIntent(userQuery);
    
    // 2. Provider Discovery
    const providers = await discoverProviders(intent);
    
    if (!providers || providers.length === 0) {
        await logStep('Orchestration_Failed', 'No providers found matching the intent');
        return { success: false, error: 'No providers found.', intent };
    }

    // 3. Ranking & Reasoning
    const rankingResult = await rankProviders(providers, intent);
    
    if (!rankingResult || !rankingResult.provider) {
        await logStep('Orchestration_Failed', 'Failed to rank or select a provider');
        return { success: false, error: 'Failed to select provider.', intent, providers };
    }

    // 4. Simulate Booking
    const booking = await createBooking(rankingResult.provider, intent);

    // 5. Schedule Follow-Up
    const followUp = await scheduleFollowUp(booking);

    // Fetch the trace to return it
    const traceLogs = await WorkflowLog.find().sort({ createdAt: -1 }).limit(10); 

    await logStep('Antigravity_Orchestrator_Complete', '[Google Antigravity Brain] All agents executed successfully. Relinquishing control.');

    return {
        success: true,
        intent,
        recommendedProvider: rankingResult.provider,
        reasoning: rankingResult.reasoning,
        topProviders: rankingResult.topProviders,
        decisionPanel: rankingResult.decisionPanel,
        booking,
        followUp,
        logs: traceLogs,
        confidenceMetrics: {
           intent: intent.confidenceScore || 80,
           match: rankingResult.matchConfidenceScore || 85,
           ranking: rankingResult.rankingConfidenceScore || 90,
           booking: booking._doc?.confidenceScore || 85
        }
    };

  } catch (error) {
    await logStep('Antigravity_Orchestrator_FatalError', '[Google Antigravity Brain] Workflow crashed during execution', { error: error.message, stack: error.stack });
    return {
        success: false,
        error: 'Workflow crashed: ' + error.message
    };
  }
}

module.exports = {
  orchestrateWorkflow
};
