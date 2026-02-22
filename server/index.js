const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const degreesRoutes = require('./routes/degrees.routes');
const userRoutes = require('./routes/user.routes');
const modulesRoutes = require('./routes/modules.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/degrees', degreesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/modules', modulesRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

start();
