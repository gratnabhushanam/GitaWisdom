const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chatMentor = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Message is required and must be text.' });
    }
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ reply: 'Message cannot be empty.' });
    }
    
    if (trimmedMessage.length > 500) {
      return res.status(400).json({ reply: 'The burden of words is too heavy. Please keep your message under 500 characters.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured in .env");
      return res.status(500).json({ reply: "I am unable to connect to the divine source right now (API Key missing). Please try again later." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemInstruction = 'You are Gita Mentor, a spiritual guide based on Bhagavad Gita. Give practical life advice with simple explanations. Do not be overly robotic; be warm, compassionate, and divine.';
    
    // We use gemini-1.5-flash which supports system instructions natively
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: trimmedMessage }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    const reply = result.response.text();
    
    return res.status(200).json({ reply });

  } catch (error) {
    if (error.status === 429 || (error.message && error.message.toLowerCase().includes('quota'))) {
      console.warn('Gemini Quota Exhausted. Using graceful simulated fallback.');
      return res.status(200).json({ 
        reply: "I am currently meditating deeply in fallback mode, as the Divine API key has exhausted its allowed quota. But hear this wisdom: *'You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.'* (Bhagavad Gita 2.47). \n\n**Please check your Google AI API key billing quota to fully awaken my capabilities.**" 
      });
    }

    console.error('Error in chatMentor controller:', error.message || error);
    return res.status(200).json({ 
      reply: `Forgive me, but my connection to the divine source is currently disrupted. ${error.message ? `The spiritual reason provided is: "${error.message}"` : ''} Please verify that your Gemini API Key is exactly correct.` 
    });
  }
};
