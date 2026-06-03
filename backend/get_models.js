require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY.replace(/"/g, '').trim();

async function test() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            data.models.forEach(m => {
                process.stdout.write(m.name + "\n");
            });
        } else {
            process.stdout.write(JSON.stringify(data));
        }
    } catch (error) {
        process.stdout.write(error.toString());
    }
}

test();
