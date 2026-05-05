const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const rackRoutes = require('./routes/racks');
const statsRoutes = require('./routes/stats');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors()); // Absolute most permissive
app.options('*', cors()); // Allow preflight for all routes
app.use(express.json());

// Request Tracker (to see if Vercel is reaching us)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
 
// Root Route
app.get('/', (req, res) => res.send('🚀 Lumina Library Backend is Running!'));

const pool = require('./db');

// Test Postgres Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('PostgreSQL Connection Error:', err);
    } else {
        console.log('✅ PostgreSQL Connected Successfully via raw SQL (pg)');
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'healthy', db: 'connected', time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
