const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");

 
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

exports.askAiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User not authenticated correctly." });
        }

        const userId = req.user.id;

 
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are the Echo App AI Assistant. Echo is a mood and journal app where users save 'Echoes'. Help users with app features and rank levels (50 echoes = new rank). Keep it concise, friendly, and buttery-smooth."
        });

        let userChat = await Chat.findOne({ userId });

      
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'ai' ? 'model' : msg.role,
            parts: msg.parts
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

     
        const slicedHistory = filteredHistory.slice(-10);

      
        const chat = model.startChat({
            history: slicedHistory,
        });

    
        const result = await chat.sendMessage(message);
        const botResponseText = result.response.text();

      
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
        console.error("Message:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
        
        res.status(500).json({ error: "The Echo-sphere is currently unstable. Try again in a moment." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Not authorized." });
        }
        
        const userChat = await Chat.findOne({ userId: req.user.id });
        res.json(userChat ? userChat.messages : []);
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: "Could not fetch history." });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Not authorized." });
        }

        await Chat.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({ message: "Chat history deleted successfully." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Could not delete history." });
    }
};
