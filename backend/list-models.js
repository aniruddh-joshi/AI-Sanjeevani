const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Listing available models...");
        // Use the built-in method to list models if available in this SDK version
        // or just try a direct fetch to the list endpoint
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels(); // This might not work
        console.log("Models:", models);
    } catch (error) {
        console.error("Failed to list models:", error.message);

        // Try native fetch approach to bypass SDK potential issues
        const https = require('https');
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log("Direct API Response (List Models):", data);
            });
        }).on('error', (err) => {
            console.error('Direct API Error:', err.message);
        });
    }
}

listModels();
