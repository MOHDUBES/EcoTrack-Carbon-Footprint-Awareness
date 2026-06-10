require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.static('.'));
app.use(express.json());

// Initialize Gemini SDK
// Note: Requires GEMINI_API_KEY environment variable to be set
const ai = new GoogleGenAI();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Construct prompt with user context
    let prompt = "You are EcoBot, a helpful AI assistant focused on carbon footprint reduction. Keep responses concise, friendly, and actionable.\\n";
    if (context) {
      prompt += `User context: Carbon score is ${context.total || 0} tons/yr (Transport: ${context.transport || 0}, Diet: ${context.diet || 0}, Energy: ${context.energy || 0}, Shopping: ${context.shopping || 0}).\\n`;
    }
    prompt += `User query: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port', port));
