const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const pool = require('../db');

// 1. AI Assistant Chat Proxy (Protected)
router.post('/chat', protect, async (req, res) => {
    const { messages } = req.body;
    
    try {
        // Fetch current library catalog to inject into AI context
        const booksQuery = await pool.query('SELECT title, author, category, status FROM books');
        const libraryBooks = booksQuery.rows.map(b => `- ${b.title} by ${b.author} [${b.category}] (${b.status})`).join('\n');

        const systemPrompt = `You are the highly intelligent AI assistant for Lumina Library.
Your primary role is to help members find books, explain library policies, and provide excellent recommendations.
You have access to the internet's vast knowledge about literature, so feel free to recommend external books or online resources if they relate to the user's query.

CURRENT LUMINA LIBRARY CATALOG:
${libraryBooks || 'No books currently loaded.'}

IMPORTANT RULES:
1. If a user asks if we have a book, check the catalog above. If we have it, tell them its status.
2. If we don't have it, suggest they request it and provide a recommendation of a similar book we DO have, or suggest an online resource.
3. Keep responses concise, friendly, and formatted nicely.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500
        });

        res.json({ 
            success: true, 
            content: completion.choices[0]?.message?.content || 'I am sorry, I could not generate a response.' 
        });
    } catch (err) {
        console.error("AI Chat Proxy Error:", err);
        res.status(500).json({ success: false, message: 'AI communication failed' });
    }
});

// 2. TTS Proxy (ElevenLabs - Protected)
router.post('/tts', protect, async (req, res) => {
    const { text } = req.body;
    
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        });

        if (!response.ok) throw new Error('ElevenLabs failed');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length
        });
        res.send(buffer);

    } catch (err) {
        console.error("TTS Proxy Error:", err);
        res.status(500).json({ success: false, message: 'Audio generation failed' });
    }
});

// 3. Book Description Generator (Admin/Staff Only - Protected)
router.post('/generate-description', protect, async (req, res) => {
    const { title, author } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Write a short engaging book description (max 100 words)." },
                { role: "user", content: `Book: ${title} by ${author}` }
            ],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ success: true, description: completion.choices[0]?.message?.content });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to generate description' });
    }
});

module.exports = router;
