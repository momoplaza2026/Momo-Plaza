const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Menu = require('../models/Menu');

// Basic Fuzzy Match Utility
const calculateSimilarity = (s1, s2) => {
    let longer = s1.toLowerCase();
    let shorter = s2.toLowerCase();
    if (longer.length < shorter.length) { [longer, shorter] = [shorter, longer]; }
    const longerLength = longer.length;
    if (longerLength === 0) { return 1.0; }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) { costs[j] = j; } 
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) { costs[s2.length] = lastValue; }
    }
    return costs[s2.length];
};

// Local fallback engine to handle common queries without hitting Gemini Quota
const getLocalRecommendation = async (message, menuItems) => {
    let msg = message.toLowerCase().trim()
        .replace(/order|want|to|have|can|i|please|get|me|a|some/g, '') // Clean filler words
        .replace(/[0-9]|₹|rs|rs.|-|,|\.|\/|qty|quantity/g, '') // Strip prices, numbers and symbols
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
    
    if (!msg || msg.length < 2) return ""; // Ignore very short or empty inputs

    // 1. Check for specific categories / traits
    if (msg.includes('popular') || msg.includes('best') || msg.includes('top rated')) {
        const items = [...menuItems].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
        return "Our most loved dishes are:\n" + items.map(i => `⭐ **${i.name}** - ₹${i.price}`).join('\n') + "\n\nWhich one should I add for you?";
    } 
    
    if (msg.includes('veg') || msg.includes('vegetarian')) {
        const items = menuItems.filter(i => i.isVeg).slice(0, 4);
        return "I've found some delicious vegetarian options for you:\n" + items.map(i => `🌱 **${i.name}** - ₹${i.price}`).join('\n');
    }

    if (msg.includes('budget') || msg.includes('cheap') || msg.includes('low price')) {
        const items = [...menuItems].sort((a, b) => a.price - b.price).slice(0, 3);
        return "Here are some pocket-friendly meals for you:\n" + items.map(i => `💰 **${i.name}** - ₹${i.price}`).join('\n');
    }

    // 2. Advanced Fuzzy Match for Menu Items
    const scoredMatches = menuItems.map(item => {
        const itemName = item.name.toLowerCase();
        
        // 2a. Whole string similarity (Best for multi-word items like "Chicken Tikka Masala")
        const fullSimilarity = calculateSimilarity(msg, itemName);
        
        // 2b. Character containment check (Very boosty)
        let containsScore = 0;
        if (itemName === msg) containsScore = 1.0;
        else if (itemName.includes(msg) || msg.includes(itemName)) containsScore = 0.95;

        // 2c. Word-by-word similarity (Best for typos in single words)
        const itemWords = itemName.split(' ');
        const wordScores = itemWords.map(word => calculateSimilarity(msg, word));
        const maxWordScore = Math.max(...wordScores);
        
        const finalScore = Math.max(fullSimilarity, containsScore, maxWordScore);
        return { item, score: finalScore };
    })
    .filter(m => m.score > 0.45) 
    .sort((a, b) => b.score - a.score);
    
    if (scoredMatches.length > 0) {
        const best = scoredMatches[0];
        // If it's a very strong match or the only decent match
        if (best.score > 0.75 || (best.score > 0.55 && scoredMatches.length === 1)) {
            return `I think you want **${best.item.name}**! Shall I add it to your cart? [ACTION:ORDER|${best.item._id}]`;
        } else {
            // Filter out very low scores for suggestions
            const suggestions = scoredMatches.filter(m => m.score > 0.5).slice(0, 3);
            return `Did you mean one of these?\n` + suggestions.map(m => `• ${m.item.name}`).join('\n');
        }
    }

    return "";
};

const getAiRecommendations = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // 1. FETCH MENU & TRY LOCAL FALLBACK FIRST
        // This saves API quota and is much faster
        const menuItems = await Menu.find({ isAvailable: { $ne: false } }).select('name _id price rating category isVeg orders');
        
        console.log(`🧞 AI Controller: Checking local brain for: "${message}"`);
        const localResponse = await getLocalRecommendation(message, menuItems);
        
        if (localResponse) {
            console.log("✅ Match Found (Local)");
            return res.json({ text: localResponse + "\n\n*(Responding via local intelligence)*" });
        }

        // 2. CALL GEMINI ONLY IF NO LOCAL MATCH
        console.log(`🚀 Calling Gemini for: "${message}"`);
        const menuSummary = menuItems.map(item => `${item.name} (ID: ${item._id})`).join(', ');
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemPrompt = `You are MealMatrix Genie. 
        MENU: [${menuSummary.substring(0, 3500)}]
        RULES:
        1. For orders, add tag: [ACTION:ORDER|ITEM_ID]
        2. Be short, friendly and use emojis.`;

        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                ...history.map(h => ({ role: h.role === 'ai' ? 'model' : 'user', parts: [{ text: h.text }] })),
                { role: "user", parts: [{ text: message }] }
            ],
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
        });

        const text = result.response.text();
        res.json({ text });

    } catch (error) {
        const isQuotaError = error.status === 429 || error.message?.includes('429');
        
        if (!isQuotaError) {
            console.error("AI Error (Gemini):", error.message || error);
        } else {
            console.log("🧞 Gemini Quota Exceeded - Falling back to local/cooldown response.");
        }
        
        // --- EMERGENCY LOCAL FALLBACK ---
        try {
            const menuItems = await Menu.find({ isAvailable: { $ne: false } }).select('name _id price rating category isVeg');
            const fallback = await getLocalRecommendation(req.body.message, menuItems);
            if (fallback) {
                return res.json({ text: fallback + "\n\n*(Gemini is taking a nap, but I'm here to help!)*" });
            }
        } catch (dbError) {}

        if (isQuotaError) {
             const retryDelay = error.errorDetails?.[0]?.retryDelay || "30s";
             return res.status(429).json({ 
                message: `I'm a bit overwhelmed! 🧞‍♂️ Please hold on for about ${retryDelay}. I'm still ready to take your menu orders! 🍕`,
                retryAfter: parseInt(retryDelay) || 30
            });
        }

        res.status(500).json({ message: "My magic lamp is flickery. Try again in a moment! 🧞" });
    }
};

module.exports = { getAiRecommendations };

