const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function callGemini(prompt, isJsonResponse = true) {
  try {
    const config = {
      // temperature: 0.2, // uncomment if we want more deterministic output
    };
    
    if (isJsonResponse) {
        config.responseMimeType = "application/json";
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
    });
    
    let text = response.text;
    if (isJsonResponse) {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Gemini didn't return valid JSON:", text);
        return null;
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

module.exports = {
  callGemini
};
