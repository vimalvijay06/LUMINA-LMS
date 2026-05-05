const dotenv = require('dotenv');
dotenv.config();

async function testElevenLabs() {
    try {
        console.log("Testing ElevenLabs with key:", process.env.ELEVENLABS_API_KEY.substring(0, 10) + "...");
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ ElevenLabs is working! Found", data.voices.length, "voices.");
        } else {
            const error = await response.json();
            console.error("❌ ElevenLabs Error:", error.detail?.message || response.statusText);
        }
    } catch (err) {
        console.error("❌ ElevenLabs Test Failed:", err.message);
    }
}

testElevenLabs();
