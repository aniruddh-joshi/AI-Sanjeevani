const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    // Try different models - maybe one has remaining quota
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say: Ready!");
            const response = await result.response;
            console.log(`✅ ${modelName} works:`, response.text());
            return;
        } catch (error) {
            console.error(`❌ ${modelName} failed:`, error.message.substring(0, 100));
        }
    }
}

test();
