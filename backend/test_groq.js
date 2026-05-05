const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
    try {
        console.log("Testing Groq with key:", process.env.GROQ_API_KEY.substring(0, 10) + "...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello!" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Groq Response:", completion.choices[0]?.message?.content);
        console.log("✅ Groq is working properly!");
    } catch (err) {
        console.error("❌ Groq Test Failed:", err.message);
    }
}

testGroq();
