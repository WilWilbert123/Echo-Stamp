const axios = require('axios');
const Chat = require("../models/Chat");

exports.askAiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User not authenticated correctly." });
        }

        const userId = req.user.id;
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
        
    
        const model = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

     
        let userChat = await Chat.findOne({ userId });
   
        let formattedHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'ai' ? 'model' : msg.role,
            parts: [{ text: msg.parts[0].text }]
        })) : [];

     
        let finalContents = [];
        formattedHistory.forEach((msg, index) => {
            if (index === 0 || msg.role !== formattedHistory[index - 1].role) {
                finalContents.push(msg);
            }
        });

 
        const systemPrompt = {
            role: "user",
            parts: [{ text: "SYSTEM: You are the Echo App AI Assistant. Echo is a mood/journal app. 50 echoes = new rank. Be concise and friendly." }]
        };
        const systemAck = {
            role: "model",
            parts: [{ text: "Understood. I am ready to help with Echo Stamp!" }]
        };
 
        const payload = {
            contents: [
                systemPrompt,
                systemAck,
                ...finalContents.slice(-10), 
                { role: "user", parts: [{ text: message }] }
            ]
        };

        // 5. AXIOS CALL
        const apiRes = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponseText) {
            throw new Error("AI returned empty content.");
        }

        // 6. SAVE TO DB
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
            if (userChat.messages.length > 100) {
                userChat.messages = userChat.messages.slice(-100);
            }
            await userChat.save();
        } else {
            await Chat.create({
                userId,
                messages: [newUserMsg, newBotMsg]
            });
        }

        res.json({ text: botResponseText });

    } catch (error) {
        console.error("❌ AXIOS/GEMINI ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: "The Echo-sphere is hazy. Please try again." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Not authorized." });
        const userChat = await Chat.findOne({ userId: req.user.id });
        res.json(userChat ? userChat.messages : []);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history." });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Not authorized." });
        await Chat.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({ message: "History cleared." });
    } catch (error) {
        res.status(500).json({ error: "Could not delete history." });
    }
};
