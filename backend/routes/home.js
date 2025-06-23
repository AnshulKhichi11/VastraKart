const express = require('express');
const router = express.Router();
const Store = require('../models/Store'); // Import your Store model

// GET / - Homepage: Display all stores
router.get('/', async (req, res) => {
    try {
        const stores = await Store.find({});

        res.render('home', {
            stores: stores,
            user: req.session.user || null,
            success: req.flash('success'),
            error: req.flash('error'),
            title: 'Vastrakart - Discover Local Shops' // <-- CHANGE 'pageTitle' to 'title' here
        });
    } catch (error) {
        console.error('Error fetching stores for homepage:', error);
        req.flash('error', 'Failed to load shops. Please try again later.');
        res.status(500).render('home', {
            stores: [],
            user: req.session.user || null,
            success: req.flash('success'),
            error: req.flash('error'),
            title: 'Vastrakart - Error' // <-- CHANGE 'pageTitle' to 'title' here too
        });
    }
});

// You might have other general routes here like /about, /contact, etc.

module.exports = router;