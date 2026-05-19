const Provider = require('../models/Provider');
const { estimateDistance } = require('../services/mapsService');
const { logStep } = require('./workflowLoggingAgent');

async function discoverProviders(intent) {
  const { serviceType, location } = intent;
  await logStep('ProviderDiscovery_Start', `Discovering providers for service: ${serviceType} at ${location}`, intent);

  try {
    let query = {};
    if (serviceType && serviceType !== 'Unknown') {
      // Basic regex match for hackathon demo
      query.category = { $regex: new RegExp(serviceType.split(' ')[0], 'i') };
    }

    const providers = await Provider.find(query);
    
    // Enrich with estimated distance
    const enrichedProviders = [];
    for (const p of providers) {
      let distanceInfo = { distanceText: 'Unknown', distanceValue: 999999 };
      if (location !== 'Unknown') {
          distanceInfo = await estimateDistance(p.location || 'Islamabad', location);
      }
      
      enrichedProviders.push({
        _id: p._id,
        name: p.name,
        category: p.category,
        rating: p.rating,
        price: p.price,
        providerLocation: p.location,
        distanceText: distanceInfo.distanceText,
        distanceValue: distanceInfo.distanceValue,
        availability: p.availability,
        avatar: p.avatar
      });
    }

    await logStep('ProviderDiscovery_Success', `Discovered ${enrichedProviders.length} potential providers`, { count: enrichedProviders.length });
    return enrichedProviders;
  } catch (error) {
    await logStep('ProviderDiscovery_Error', 'Failed to discover providers', { error: error.message });
    return [];
  }
}

module.exports = {
  discoverProviders
};
