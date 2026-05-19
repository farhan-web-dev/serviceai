const axios = require('axios');

async function estimateDistance(origin, destination) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'mock_key') {
    // Mock for hackathon if no real key provided
    console.log(`[MapsService Mock] Calculating distance from ${origin} to ${destination}`);
    const randomDistance = (Math.random() * 10 + 1).toFixed(1); // 1.0 to 11.0 km
    return {
      distanceText: `${randomDistance} km`,
      distanceValue: parseFloat(randomDistance) * 1000,
      durationText: `${Math.ceil(randomDistance * 3)} mins`
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      return {
        distanceText: element.distance.text,
        distanceValue: element.distance.value,
        durationText: element.duration.text
      };
    } else {
      throw new Error('Could not calculate distance');
    }
  } catch (error) {
    console.error('Error calling Maps API:', error.message);
    // Fallback mock
    return {
      distanceText: 'Unknown',
      distanceValue: 999999,
      durationText: 'Unknown'
    };
  }
}

module.exports = {
  estimateDistance
};
