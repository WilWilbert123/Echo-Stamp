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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      
        let userChat = await Chat.findOne({ userId });

        
        const history = userChat ? userChat.messages.map(msg => ({
            role: msg.role,
            parts: msg.parts
        })).slice(-15) : []; 

       
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are the Echo App AI Assistant. Echo is a mood and journal app where users save 'Echoes' (memories with location, mood, and photos). Help users with app features and rank levels (50 echoes = new rank). Keep it concise and friendly." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to help Pioneers with their Echoes!" }],
                },
                ...history 
            ],
        });

     
        const result = await chat.sendMessage(message);
        const botResponseText = result.response.text();

    
        const newMessages = [
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: botResponseText }] }
        ];

        if (userChat) {
          
            userChat.messages.push(...newMessages);
            await userChat.save();
        } else {
         
            await Chat.create({
                userId,
                messages: newMessages
            });
        }

        res.json({ text: botResponseText });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI Assistant is resting right now." });
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
