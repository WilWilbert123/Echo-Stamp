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
                text: "I'm sorry, I can only help with your Echo Stamp journal and mood tracking. Let's talk about your day instead!" 
            });
        }

        const userId = req.user._id;
      
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            console.error("❌ ERROR: GOOGLE_GEMINI_API_KEY is not defined in Environment Variables.");
            return res.status(500).json({ error: "AI Service is not configured on the server." });
        }

       
        const model = "gemini-2.5-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

       
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

        
        const payload = {
            contents: [
                { 
                    role: "user", 
                    parts: [{ text: "SYSTEM: You are Echo AI, a warm and empathetic journal assistant for the app 'Echo Stamp'. Users earn new ranks every 50 echoes. Provide thoughtful, multi-sentence reflections. Never discuss hacking or security exploits." }] 
                },
                { 
                    role: "model", 
                    parts: [{ text: "Understood. I am Echo AI, ready to help you reflect on your memories and track your Echoes." }] 
                },
                ...filteredHistory.slice(-6), 
                { 
                    role: "user", 
                    parts: [{ text: message }] 
                }
            ],
            generationConfig: {
                maxOutputTokens: 1024,  
                temperature: 0.7, 
                topP: 0.8,
                topK: 40
            }
        };

       
        const apiRes = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000  
        });

        const botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponseText) {
            throw new Error("Gemini returned an empty response. Possible safety filter block.");
        }

     
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
           
            if (userChat.messages.length > 50) {
                userChat.messages = userChat.messages.slice(-50);
            }
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }
 
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

        res.status(200).json({ message: "History cleared successfully." });
    } catch (err) {
        console.error("❌ Clear History Error:", err.message);
        res.status(500).json({ error: "Failed to clear history from database." });
    }
};