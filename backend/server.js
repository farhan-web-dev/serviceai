require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Provider = require('./models/Provider');
const Booking = require('./models/Booking');
const WorkflowLog = require('./models/WorkflowLog');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Helper to log workflows (Keeping the old one for compatibility, but moving to new agent logic)
const { logStep } = require('./agents/workflowLoggingAgent');

const { extractIntent } = require('./agents/intentAgent');
const { discoverProviders } = require('./agents/discoveryAgent');
const { createBooking } = require('./agents/bookingAgent');
const { orchestrateWorkflow } = require('./orchestrators/mainOrchestrator');

// 0. NEW: Autonomous Orchestrator Route
app.post('/api/orchestrate', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text query is required' });

  const result = await orchestrateWorkflow(text);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// 1. Intent Extraction Route (Modularized with AI)
app.post('/api/intent', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const intent = await extractIntent(text);
  res.json(intent);
});

// 2. Providers Route (Modularized with AI/Maps)
app.get('/api/providers', async (req, res) => {
  const { category, location } = req.query;
  
  // Use discovery agent with mock intent
  const providers = await discoverProviders({
    serviceType: category || 'Unknown',
    location: location || 'Unknown',
    requestedTime: 'Unknown'
  });

  res.json(providers);
});

// 3. Bookings Route (Modularized with Agents)
app.post('/api/bookings', async (req, res) => {
  const { providerId, serviceType, location, requestedTime } = req.body;

  try {
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const intent = { serviceType, location, requestedTime };
    const booking = await createBooking(provider, intent);
    
    // Simulate Follow-up optionally here or let UI call it separately
    
    res.json({
      success: true,
      booking,
      provider
    });
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

// 4. Logs Route
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await WorkflowLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

