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

        // 1. DIRECT ENDPOINT (Fixed to v1 and gemini-2.5-flash as per your request)
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        // 2. RETRIEVE HISTORY
        let userChat = await Chat.findOne({ userId });
        
        // Clean history and fix legacy roles
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'ai' ? 'model' : msg.role,
            parts: [{ text: msg.parts[0].text }]
        })) : [];

        // 3. SEQUENCE GUARD: Ensure roles alternate (User -> Model -> User)
        let filteredHistory = [];
        rawHistory.forEach((msg, index) => {
            if (index === 0 || msg.role !== rawHistory[index - 1].role) {
                filteredHistory.push(msg);
            }
        });

        // Ensure history sequence starts with 'user'
        if (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
            filteredHistory.shift(); 
        }

        // 4. CONSTRUCT PAYLOAD
        // Prepending System Instructions as a User/Model pair since we are using the direct API
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: "SYSTEM: You are the Echo App AI Assistant. Echo is a mood and journal app. 50 echoes = new rank. Be concise and friendly." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am the Echo Assistant, ready to help!" }]
                },
                ...filteredHistory.slice(-10), // Context limit
                {
                    role: "user",
                    parts: [{ text: message }]
                }
            ]
        };

        // 5. SEND VIA AXIOS
        const apiRes = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botResponseText) {
            throw new Error("AI returned empty content. Check API credits or safety filters.");
        }

        // 6. PERSIST TO DATABASE
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
        console.error("--- Echo AI Error ---");
        // Log the actual error response from Google if available
        console.error("Details:", error.response?.data || error.message);
        
        res.status(500).json({ 
            error: "The Echo-sphere is currently unstable.",
            debug: error.response?.data?.error?.message || error.message
        });
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
        res.status(200).json({ message: "Chat history deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Could not delete history." });
    }
};
