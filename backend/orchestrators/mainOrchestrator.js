const { extractIntent } = require('../agents/intentAgent');
const { discoverProviders } = require('../agents/discoveryAgent');
const { rankProviders } = require('../agents/rankingAgent');
const { createBooking } = require('../agents/bookingAgent');
const { scheduleFollowUp } = require('../agents/followUpAgent');
const { logStep } = require('../agents/workflowLoggingAgent');
const WorkflowLog = require('../models/WorkflowLog');

async function orchestrateWorkflow(userQuery) {
  const sessionId = new Date().getTime().toString(); // Simple correlation ID for the workflow

  await logStep('Orchestration_Start', \`Starting autonomous workflow for: "\${userQuery}"\`, { sessionId });

  try {
    // 1. Intent Extraction
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

    // Fetch the trace to return it (optional but good for UI)
    // Wait for a small amount of time to ensure DB writes are committed before fetch
    const traceLogs = await WorkflowLog.find().sort({ createdAt: -1 }).limit(10); // fetch recent logs

    await logStep('Orchestration_Complete', 'Autonomous workflow finished successfully');

    return {
        success: true,
        intent,
        recommendedProvider: rankingResult.provider,
        reasoning: rankingResult.reasoning,
        booking,
        followUp,
        logs: traceLogs
    };

  } catch (error) {
    await logStep('Orchestration_FatalError', 'Workflow crashed', { error: error.message, stack: error.stack });
    return {
        success: false,
        error: 'Workflow crashed: ' + error.message
    };
  }
}

module.exports = {
  orchestrateWorkflow
};
