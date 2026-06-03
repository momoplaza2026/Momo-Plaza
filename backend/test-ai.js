const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testing with API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
        console.log("Success!");
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
