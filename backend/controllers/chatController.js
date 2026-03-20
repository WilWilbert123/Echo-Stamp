const axios = require('axios');
const Chat = require("../models/Chat");
 
exports.askAiAssistant = async (req, res) => {
   
    console.log("📩 Request received from User:", req.user?._id);

    try {
        const { message } = req.body;

        // Validation
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const userId = req.user._id;
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
 
        const model = "gemini-1.5-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

       
        let userChat = await Chat.findOne({ userId });
     
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role, // Must be 'user' or 'model'
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

       
        const payload = {
            contents: [
                { 
                    role: "user", 
                    parts: [{ text: "SYSTEM: You are the Echo App AI Assistant. Echo is a mood/journal app. 50 echoes = new rank. Be concise, friendly, and helpful." }] 
                },
                { 
                    role: "model", 
                    parts: [{ text: "Understood! I am the Echo Assistant. How can I help with your memories today?" }] 
                },
                ...filteredHistory.slice(-8),  
                { 
                    role: "user", 
                    parts: [{ text: message }] 
                }
            ],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        };

      
        const apiRes = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000  
        });

        const botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponseText) {
            throw new Error("Gemini returned an empty response.");
        }

      
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
          
            if (userChat.messages.length > 100) {
                userChat.messages = userChat.messages.slice(-100);
            }
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }

        // 7. Final Success Response
        res.json({ text: botResponseText });

    } catch (error) {
      
        const apiError = error.response?.data?.error?.message || error.message;
        console.error("❌ GEMINI API ERROR:", apiError);
        
        res.status(500).json({ 
            error: "The Echo-sphere is currently unstable.",
            details: apiError 
        });
    }
};
 
exports.getChatHistory = async (req, res) => {
    try {
        const userChat = await Chat.findOne({ userId: req.user._id });
        res.json(userChat ? userChat.messages : []);
    } catch (err) {
        console.error("Fetch History Error:", err.message);
        res.status(500).json({ error: "Failed to load history" });
    }
};
 
exports.clearChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;  
        const result = await Chat.findOneAndDelete({ userId });
        
        if (!result) {
            return res.status(404).json({ message: "No history found to clear." });
        }

        console.log(`🗑️ History cleared for user: ${userId}`);
        res.status(200).json({ message: "History cleared successfully." });
    } catch (err) {
        console.error("❌ Clear History Error:", err.message);
        res.status(500).json({ error: "Failed to clear history from database." });
    }
};