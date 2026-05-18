const WorkflowLog = require('../models/WorkflowLog');

async function logStep(stepName, description, metadata = {}) {
  try {
    const log = new WorkflowLog({
      step: stepName,
      description,
      metadata
    });
    await log.save();
    console.log(`[AGENT: Logger] ${stepName} - ${description}`);
    return log;
  } catch (error) {
    console.error('[AGENT: Logger] Error saving log:', error);
  }
}

module.exports = {
  logStep
};
