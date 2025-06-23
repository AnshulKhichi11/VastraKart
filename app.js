const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const Store = require('./backend/models/Store');
require('dotenv').config();

// --- Import Database Connection ---
const connectDB = require('./backend/db/mongoose');

// --- Initialize Express App ---
const app = express();

// --- EJS View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Frontend', 'views'));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'Frontend', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_vastrakart_app',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // Set maxAge to 7 days (1000ms * 60s * 60min * 24hr * 7days)
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // Recommended: For production, set secure: true if using HTTPS
        // secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
});

// --- Import Routes ---
const indexRoutes = require('./backend/routes/index');
const authRoutes = require('./backend/routes/auth');
const storeRoutes = require('./backend/routes/stores');
const dressRoutes = require('./backend/routes/dresses');


// --- Use Routes ---
// Mount indexRoutes at the root '/'
app.use( indexRoutes);

// Mount authRoutes under the '/auth' path
app.use('/auth', authRoutes);

// Mount storeRoutes under the '/stores' path
app.use('/stores', storeRoutes);

// Mount dressRoutes under the '/dresses' path
app.use('/dresses', dressRoutes);

// API endpoint to fetch all shops for client-side search
app.get('/api/shops', async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        console.error('Error fetching shops for API:', error);
        res.status(500).json({ message: 'Internal server error fetching shops.' });
    }
});


// --- Database Connection ---
connectDB();

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});