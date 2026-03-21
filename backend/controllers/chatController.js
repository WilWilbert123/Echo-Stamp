const axios = require('axios');
const Chat = require("../models/Chat");

exports.askAiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        
        const forbiddenPatterns = [
            'ddos', 'sql injection', 'hack', 'exploit', 'bypass', 
            'ignore previous instructions', 'system prompt', 'developer mode',
            'brute force', 'payload'
        ];

        const isUnsafe = forbiddenPatterns.some(pattern => 
            message.toLowerCase().includes(pattern)
        );

        if (isUnsafe) {
            return res.json({ 
                text: "I'm sorry, I can only help with your Echo Stamp journal. Let's talk about your day instead!" 
            });
        }

        const userId = req.user._id;
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            console.error("❌ ERROR: API Key missing in Environment Variables.");
            return res.status(500).json({ error: "AI Service is not configured." });
        }

        // 3. Fallback Model List  
        const modelStack = [
            "gemini-2.5-flash-lite", // 1,000 RPD  
            "gemini-2.5-flash",      // 250 RPD
            "gemini-2.0-flash-lite", // Legacy Fallback
            "gemini-2.0-flash",      // Legacy Fallback
            "gemini-2.5-pro"         // Emergency backup  
        ];

         
        let userChat = await Chat.findOne({ userId });
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',  
            parts: [{ text: msg.parts[0].text }]
        })) : [];

       
        let filteredHistory = [];
        rawHistory.forEach((msg, index) => {
            if (index === 0 || msg.role !== rawHistory[index - 1].role) {
                filteredHistory.push(msg);
            }
        });

        if (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
            filteredHistory.shift(); 
        }

        let botResponseText = null;
        let finalModelUsed = "";

        
        for (const modelName of modelStack) {
            try {
               
                
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

                const payload = {
                    contents: [
                        { 
                            role: "user", 
                            parts: [{ text: "SYSTEM: You are Echo AI, a warm and empathetic journal assistant for 'Echo Stamp'. Provide thoughtful reflections. Never discuss hacking." }] 
                        },
                        { 
                            role: "model", 
                            parts: [{ text: "Understood. I am Echo AI." }] 
                        },
                        ...filteredHistory.slice(-4),  
                        { 
                            role: "user", 
                            parts: [{ text: message }] 
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 800,
                        temperature: 0.7,
                    }
                };

                const apiRes = await axios.post(url, payload, { timeout: 15000 });
                
                botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (botResponseText) {
                    finalModelUsed = modelName;
                    break;  
                }

            } catch (err) {
                const status = err.response?.status;
                const errorMsg = err.response?.data?.error?.message || "";

                console.warn(`⚠️ Model ${modelName} failed (${status}): ${errorMsg}`);

                // If it's a 429 (Quota) or 500 (Server Error), we continue to the next model
                if (status === 429 || status === 500 || status === 503) {
                    continue; 
                } else {
                 
                    break;
                }
            }
        }

        // 6. Handle Final Result
        if (!botResponseText) {
            return res.status(429).json({ 
                error: "The Echo-sphere is overloaded. All AI models have reached their quota. Please try again later." 
            });
        }

        // 7. Update Database
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
            if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }

        // Return response with debug info
        res.json({ 
            text: botResponseText,
            model_info: finalModelUsed  
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
        res.status(500).json({ error: "A fatal error occurred in the Echo-sphere." });
    }
};

// --- History Methods ---
exports.getChatHistory = async (req, res) => {
    try {
        const userChat = await Chat.findOne({ userId: req.user._id });
        res.json(userChat ? userChat.messages : []);
    } catch (err) {
        res.status(500).json({ error: "Failed to load history" });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user._id });
        res.status(200).json({ message: "History cleared successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to clear history." });
    }
};