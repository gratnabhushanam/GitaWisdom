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

    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("AI_API_KEY not configured in .env");
      return res.status(500).json({ reply: "I am unable to connect to the divine source right now (API Key missing). Please try again later." });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cost effective, fast
      messages: [
        { 
          role: 'system', 
          content: 'You are Gita Mentor, a spiritual guide based on Bhagavad Gita. Give practical life advice with simple explanations.'
        },
        {
          role: 'user',
          content: trimmedMessage
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error in chatMentor controller:', error);
    return res.status(500).json({ reply: 'Failed to seek divine guidance. My spiritual network encountered an interruption.' });
  }
};
