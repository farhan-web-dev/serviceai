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

const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } else {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB at', uri);
    
    // Auto-seed if memory server is used
    try {
      const Provider = require('./models/Provider');
      const count = await Provider.countDocuments();
      if (count === 0) {
        console.log('Seeding initial providers...');
        const providers = [
          { name: 'Ali Raza', avatar: 'https://i.pravatar.cc/150?u=ali', category: 'AC Technician', location: 'G-13, Islamabad', rating: 4.8, price: 1500, availability: true, distance: '2 km' },
          { name: 'Sana Beautician', avatar: 'https://i.pravatar.cc/150?u=sana', category: 'Beautician', location: 'G-13, Islamabad', rating: 4.9, price: 3000, availability: true, distance: '1.5 km' },
          { name: 'Bilal Sparks', avatar: 'https://i.pravatar.cc/150?u=bilal', category: 'Electrician', location: 'G-13, Islamabad', rating: 4.8, price: 1200, availability: true, distance: '2 km' },
          { name: 'Rizwan Pipes', avatar: 'https://i.pravatar.cc/150?u=rizwan', category: 'Plumber', location: 'G-13, Islamabad', rating: 4.1, price: 600, availability: true, distance: '1 km' }
        ];
        await Provider.insertMany(providers);
        console.log('Seeded providers.');
      }
    } catch (err) {
      console.error('Failed to seed:', err);
    }
  }
}
connectDB().catch(err => console.error('Failed to connect to MongoDB', err));

// Helper to log workflows (Keeping the old one for compatibility, but moving to new agent logic)
const { logStep } = require('./agents/workflowLoggingAgent');

const { extractIntent } = require('./agents/intentAgent');
const { discoverProviders } = require('./agents/discoveryAgent');
const { createBooking } = require('./agents/bookingAgent');
const { orchestrateWorkflow } = require('./orchestrators/mainOrchestrator');

// 0. Google Antigravity Orchestrator Route (Core Brain)
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

// 3.5. Get Single Booking (for live tracking)
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    // Fetch logs specifically related to this booking ID
    const logs = await WorkflowLog.find({ 'metadata.bookingId': req.params.id }).sort({ createdAt: 1 });
    
    res.json({ booking, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (accessible on LAN at 192.168.30.2:${PORT})`);
});

