const mongoose = require('mongoose');

const workflowLogSchema = new mongoose.Schema({
  step: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('WorkflowLog', workflowLogSchema);
