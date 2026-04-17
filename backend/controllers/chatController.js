const axios = require('axios');
const Chat = require("../models/Chat");
const Echo = require("../models/Echo");

// Helper function to get user's echo statistics
const getUserEchoStats = async (userId) => {
    try {
        const total = await Echo.countDocuments({ userId });
        const breakdown = await Echo.aggregate([
            { $match: { userId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        const stats = { 
            total: total, 
            mood: 0, 
            gratitude: 0, 
            memory: 0 
        };
        
        breakdown.forEach(item => {
            if (item._id === 'mood') stats.mood = item.count;
            if (item._id === 'gratitude') stats.gratitude = item.count;
            if (item._id === 'memory') stats.memory = item.count;
        });
        
        return stats;
    } catch (error) {
        console.error("Error getting echo stats:", error);
        return { total: 0, mood: 0, gratitude: 0, memory: 0 };
    }
};

// Intelligent fallback response based on conversation context
const getFallbackResponse = (message, echoStats, conversationHistory = []) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        const greetings = [
            "Hello! I'm Echo, your personal journal assistant. How can I help you today? ✨",
            "Hi there! I'm Echo. Ready to explore your journal or answer any questions? 💫",
            "Hey! Great to see you. I'm Echo - ask me about your echoes, journal entries, or just chat with me! 🌟",
            "Hello! I'm Echo. What would you like to know about your journal today? 📝"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // How are you responses
    if (lowerMessage.match(/how are you|how's it going|how do you do/)) {
        const responses = [
            "I'm doing wonderful, thank you for asking! How are you feeling today? 😊",
            "I'm great! Ready to help you reflect on your journal. How can I assist you? 💭",
            "I'm fantastic! What's on your mind today? 🌈"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Thank you responses
    if (lowerMessage.match(/thank|thanks|appreciate/)) {
        const responses = [
            "You're very welcome! I'm always here to help. 💕",
            "My pleasure! Anything else you'd like to know about your journal? 📖",
            "Happy to help! Keep up the great journaling! 🌟"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Help requests
    if (lowerMessage.match(/help|what can you do|capabilities|features/)) {
        return "I can help you track your journal echoes, count your entries by type (mood, gratitude, memory), reflect on your writing, and answer questions about your journaling journey. What would you like to know? 📚";
    }
    
    // Echo counting questions
    if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) {
        if (lowerMessage.includes('echo') || lowerMessage.includes('journal') || lowerMessage.includes('entry')) {
            if (lowerMessage.includes('mood')) {
                return `You have ${echoStats.mood} mood echoes in your journal. That's wonderful self-awareness! Keep tracking your emotions. 💭`;
            } else if (lowerMessage.includes('gratitude')) {
                return `You've recorded ${echoStats.gratitude} gratitude echoes. Practicing gratitude is beautiful! 🙏`;
            } else if (lowerMessage.includes('memory')) {
                return `You have ${echoStats.memory} memory echoes saved. Cherish those precious moments! 📸`;
            } else {
                return `You have ${echoStats.total} total echoes in your journal. Great job documenting your journey! ✨`;
            }
        }
    }
    
    // Default friendly responses
    const defaultResponses = [
        `I'm Echo, your journal assistant! You have ${echoStats.total} echoes in your journal. Want me to help you track your moods, gratitude, or memories? 💫`,
        `How can I assist you with your journal today? You can ask me about your echo statistics or just have a friendly chat! 📝`,
        `I'm here to support your journaling journey. You've written ${echoStats.total} echoes so far. What would you like to explore? 🌟`,
        `What's on your mind? I can help you reflect on your journal entries or answer questions about your emotional journey. 💭`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Check if message needs echo statistics
const needsEchoStats = (message) => {
    const keywords = ['echo', 'journal', 'entry', 'count', 'how many', 'total', 'statistic', 'mood', 'gratitude', 'memory'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
};

exports.askAiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Security check
        const forbiddenPatterns = ['hack', 'exploit', 'bypass', 'sql', 'inject', 'break', 'crack'];
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

        // Get user's echo stats
        const echoStats = await getUserEchoStats(userId);

        // Get chat history
        let userChat = await Chat.findOne({ userId });
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.parts[0].text }]
        })) : [];

        // Filter consecutive same roles
        let filteredHistory = [];
        rawHistory.forEach((msg, index) => {
            if (index === 0 || msg.role !== rawHistory[index - 1].role) {
                filteredHistory.push(msg);
            }
        });

        if (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
            filteredHistory.shift();
        }

        // Updated model names for Gemini API (as of 2024-2025)
         const modelStack = [
            "gemini-2.5-flash-lite", // 1,000 RPD  
            "gemini-2.5-flash",      // 250 RPD
            "gemini-2.0-flash-lite", // Legacy Fallback
            "gemini-2.0-flash",      // Legacy Fallback
            "gemini-2.5-pro"         // Emergency backup  
        ];

        let botResponseText = null;
        let finalModelUsed = "";

        const systemPrompt = `You are Echo AI, a warm and empathetic journal assistant for 'Echo Stamp'. 

REAL-TIME USER STATISTICS:
- Total Echoes: ${echoStats.total}
- Mood Echoes: ${echoStats.mood}
- Gratitude Echoes: ${echoStats.gratitude}
- Memory Echoes: ${echoStats.memory}

IMPORTANT RULES:
1. Be conversational and friendly - respond naturally like a caring friend
2. If user says "hi", "hello", or greets you, respond warmly as Echo
3. When users ask about their echoes or journal entries, use the exact numbers above
4. Keep responses concise (1-3 sentences for simple questions, slightly longer for complex ones)
5. Be supportive and encouraging
6. Never discuss hacking or inappropriate topics

Example conversations:
User: "Hi" → "Hello! I'm Echo, your journal assistant. How can I help you today? ✨"
User: "How are you?" → "I'm doing great, thanks for asking! How are you feeling today? 💭"
User: "How many echoes do I have?" → "You have ${echoStats.total} echoes in your journal. Great work! 🌟"
User: "Count my mood echoes" → "You've recorded ${echoStats.mood} mood echoes. That's wonderful self-reflection! 💫"

Remember: Be natural, warm, and conversational. You're not just a stats bot - you're a friendly journal companion.`;

        // Try different AI models
        for (const modelName of modelStack) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

                // Build conversation context
                const conversationContents = [
                    { 
                        role: "user", 
                        parts: [{ text: systemPrompt }] 
                    },
                    { 
                        role: "model", 
                        parts: [{ text: "Understood! I'm Echo AI, your friendly journal assistant. I can see your journal statistics and I'm here to help you reflect and chat naturally." }] 
                    }
                ];
                
                // Add last 6 messages for context (3 exchanges)
                const recentHistory = filteredHistory.slice(-6);
                conversationContents.push(...recentHistory);
                
                // Add current message
                conversationContents.push({ 
                    role: "user", 
                    parts: [{ text: message }] 
                });

                const payload = {
                    contents: conversationContents,
                    generationConfig: {
                        maxOutputTokens: 300,
                        temperature: 0.8,
                        topP: 0.9,
                        topK: 40,
                    }
                };

                const apiRes = await axios.post(url, payload, { timeout: 15000 });
                
                botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (botResponseText && botResponseText.length > 0) {
                    finalModelUsed = modelName;
                    console.log(`✅ Success with model: ${modelName}`);
                    break;
                }

            } catch (err) {
                const status = err.response?.status;
                const errorMsg = err.response?.data?.error?.message || err.message;
                console.warn(`⚠️ Model ${modelName} failed (${status}): ${errorMsg}`);

                // Continue to next model on failure
                if (status === 429 || status === 500 || status === 503 || !status || err.code === 'ECONNABORTED') {
                    continue;
                } else {
                    // Don't break on authentication errors - try next model
                    if (status !== 401 && status !== 403) {
                        break;
                    }
                    continue;
                }
            }
        }

        // If all AI models fail, use enhanced fallback
        if (!botResponseText) {
            console.log("⚠️ All AI models failed, using intelligent fallback response");
            botResponseText = getFallbackResponse(message, echoStats, filteredHistory);
            finalModelUsed = "fallback";
        }

        // Clean up response if needed
        if (botResponseText && botResponseText.length > 500) {
            botResponseText = botResponseText.substring(0, 500) + "...";
        }

        // Save to database
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
            if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }

        res.json({ 
            text: botResponseText,
            stats: echoStats,
            model_info: finalModelUsed 
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
        
        // Even on critical error, try to return something useful
        try {
            const userId = req.user?._id;
            if (userId) {
                const echoStats = await getUserEchoStats(userId);
                return res.json({ 
                    text: getFallbackResponse(req.body?.message || "help", echoStats),
                    fallback: true
                });
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }
        
        res.status(500).json({ error: "I'm having trouble connecting. Please try again in a moment." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const userChat = await Chat.findOne({ userId: req.user._id });
        res.json(userChat ? userChat.messages : []);
    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).json({ error: "Failed to load history" });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user._id });
        res.status(200).json({ message: "History cleared successfully." });
    } catch (err) {
        console.error("Clear History Error:", err);
        res.status(500).json({ error: "Failed to clear history." });
    }
};