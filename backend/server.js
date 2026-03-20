const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');  
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const cloudinary = require('cloudinary').v2;

// Load environment variables
require('dotenv').config();  

// Connect to Database
connectDB();  
 
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());
app.use(morgan('dev')); 

// --- ROOT & HEALTH CHECK ROUTES ---
 
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Echo Stamp API is live and running!",
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Basic health check for Render's uptime monitor
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Ping my render
app.get('/ping', (req, res) => {
console.log("Ping received from Cron-job.org!");
res.status(200).send("Alive");
});

// --- API ROUTES ---
app.use('/api/echoes', require('./routes/echoRoutes'));
app.use('/api/users', require('./routes/userRoutes'));    
app.use('/api/journals', require('./routes/journalRoutes'));

//ai
app.use('/api/chat', chatRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- ERROR HANDLING ---
app.use(errorHandler);

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("⚠️  Warning: Cloudinary environment variables are missing!");
}
app.listen(PORT, '0.0.0.0', () => {
    console.log(`///////////////////////////////////////////////////////////`);
    console.log(`🚀 Server running on port ${PORT}`);
     console.log("✅ Cloudinary Admin Configured");
    console.log(`///////////////////////////////////////////////////////////`);
});
