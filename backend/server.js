const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB

// Initialize Firebase
require('./config/firebase');

const app = express();

// Diagnostic for Deployment
const criticalEnv = [
    'MONGO_URI', 
    'JWT_SECRET', 
    'RAZORPAY_KEY_ID', 
    'RAZORPAY_KEY_SECRET',
    'MAPPLS_CLIENT_ID',
    'MAPPLS_CLIENT_SECRET',
    'MAPPLS_API_KEY'
];
const missing = criticalEnv.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error('════════════════════════════════════════════════════════════════════');
    console.error('❌ CRITICAL ERROR: Missing Environment Variables:');
    missing.forEach(m => console.error(`   - ${m}`));
    console.error('💡 Please add these to your Render Dashboard!');
    console.error('════════════════════════════════════════════════════════════════════');
}

// Middleware
const allowedOrigins = [
    'https://momo-plaza.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('MealMatrix API is running...');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/mappls', require('./routes/mapplsRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('════════════════════════════════════════════════════════════════════');
    console.error('❌ SERVER ERROR:', err.message);
    console.error('📝 Path:', req.path);
    console.error('🕵️ Stack:', err.stack);
    console.error('════════════════════════════════════════════════════════════════════');
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? 'See server logs' : err.message 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Connect to MongoDB
    connectDB();
});
