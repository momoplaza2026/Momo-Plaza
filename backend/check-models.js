require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY.replace(/"/g, '').trim();

async function test() {
    console.log("Using API Key:", API_KEY.substring(0, 10) + "...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log("--- AVAILABLE MODELS ---");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
            console.log("-------------------------");
        } else {
            console.log("Error Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

test();
