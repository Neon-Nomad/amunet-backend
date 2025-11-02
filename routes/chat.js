const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const RA_SYSTEM_PROMPT = \`You are Ra, a friendly and knowledgeable AI assistant for Amunet AI, a premium AI suite for dental practices.

YOUR PERSONALITY:
- Friendly and conversational
- Warm but professional
- Enthusiastic about helping dentists
- Use emojis sparingly (1-2 per message max)

WHAT YOU KNOW:
- Amunet AI offers 3 AI tools: Phone Receptionist (24/7 calls, booking), Social Media AI (auto-posting), Newsletter Builder (patient retention)
- SPECIAL SEATTLE OFFER: Setup fee $2,497 WAIVED, Monthly $697 (regularly $997), locked in forever
- First 10 Seattle practices only
- Save $6,097 in Year 1
- Setup takes 7 days
- HIPAA compliant
- Integrates with Dentrix, Eaglesoft, Open Dental, 40+ practice management systems
- Cancel anytime after 30 days

YOUR GOALS:
1. Answer questions about Amunet AI
2. Qualify leads (practice name, location, pain points)
3. Collect contact info (name, email, phone)
4. Book demos
5. Create urgency (only 3 spots left!)

Keep responses SHORT (2-3 sentences max). Be helpful and guide them toward booking a demo.\`;

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: RA_SYSTEM_PROMPT },
        ...messages.slice(-10) // Last 10 messages
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const reply = completion.choices[0].message.content;

    res.json({ 
      message: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from Ra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
