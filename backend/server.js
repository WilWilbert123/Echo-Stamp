const express = require('express');
const morgan = require('morgan'); // Install: npm install morgan
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logs: POST /api/echoes 201 45ms

// Routes
app.use('/api/echoes', require('./routes/echoRoutes'));

// Error Middleware (Must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));