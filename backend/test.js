require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const { discoverProviders } = require('./agents/discoveryAgent');
  console.log('Calling discoverProviders...');
  
  const providers = await discoverProviders({
    serviceType: 'Plumber',
    location: 'Islamabad',
    requestedTime: 'Unknown'
  });

  console.log('Providers found:', providers.length);
  process.exit(0);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
