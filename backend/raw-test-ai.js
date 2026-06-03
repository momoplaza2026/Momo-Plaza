// Node 18+ has built-in fetch
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY.replace(/"/g, ''); // Clean quotes just in case

async function test() {
    console.log("Using API Key:", API_KEY);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello" }]
                }]
            })
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

test();
