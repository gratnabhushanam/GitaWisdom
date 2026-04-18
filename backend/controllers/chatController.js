const { OpenAI } = require('openai');

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

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.warn("DEEPSEEK_API_KEY not configured in .env");
      return res.status(500).json({ reply: "I am unable to connect to the divine source right now (API Key missing). Please try again later." });
    }

    // DeepSeek uses an OpenAI-compatible API with a custom base URL
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: 'system', 
          content: 'You are Gita Mentor, a spiritual guide based on Bhagavad Gita. Give practical life advice with simple explanations. Do not be overly robotic; be warm, compassionate, and divine. Keep responses concise (2-3 paragraphs max). If relevant, quote a short Sanskrit verse with English translation.'
        },
        {
          role: 'user',
          content: trimmedMessage
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    return res.status(200).json({ reply });

  } catch (error) {
    if (error.status === 429 || (error.message && error.message.toLowerCase().includes('quota'))) {
      console.warn('DeepSeek Quota Exhausted. Using graceful fallback.');
      return res.status(200).json({ 
        reply: "I am currently meditating deeply in fallback mode, as the Divine API key has exhausted its allowed quota. But hear this wisdom: *'You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.'* (Bhagavad Gita 2.47). \n\n**Please check your DeepSeek API key balance to fully awaken my capabilities.**" 
      });
    }

    console.error('Error in chatMentor controller:', error.message || error);
    return res.status(200).json({ 
      reply: `Forgive me, but my connection to the divine source is currently disrupted. ${error.message ? `The spiritual reason provided is: "${error.message}"` : ''} Please verify that your DeepSeek API Key is correct.` 
    });
  }
};
