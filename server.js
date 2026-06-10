require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const path = require('path');
const app = express();

// SECURITY FIX: Do not serve the root directory which exposes package.json, server.js, .env, etc.
// Instead, serve only specific frontend asset directories.
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(express.json());

// Serve index.html explicitly for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/favicon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.png'));
});

// Initialize Gemini SDK with fallback key to prevent server crash during startup on Cloud Run
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? {} : { apiKey: 'dummy-key-to-prevent-startup-crash' });

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
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port', port));
