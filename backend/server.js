const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');  
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

require('dotenv').config();  
connectDB();  

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(morgan('dev')); 

// Routes
app.use('/api/echoes', require('./routes/echoRoutes'));
app.use('/api/users', require('./routes/userRoutes'));   
app.use('/api/journals', require('./routes/journalRoutes'));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));