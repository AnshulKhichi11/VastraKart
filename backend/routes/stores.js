// backend/routes/stores.js

const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const Dress = require('../models/Dress');

// GET /stores/add - Display form to add a new store
router.get('/add', (req, res) => {
    res.render('addStore', {
        title: 'Add Your Shop' // Correctly passing 'title'
    });
});

// POST /stores/add - Handle submission of new store form
router.post('/add', async (req, res) => {
    try {
        const { name, location, logo, desc } = req.body;

        if (!name || !location) {
             req.flash('error', 'Store name and location are required.');
             return res.status(400).redirect('/stores/add');
        }

        const newStore = new Store({ name, location, logo, desc });
        await newStore.save();
        req.flash('success', 'Store added successfully!');
        res.redirect('/'); // Or to the new store's details page
    } catch (err) {
        console.error('Error adding store:', err);
        req.flash('error', 'Error adding store. Please try again.');
        res.status(500).redirect('/stores/add');
    }
});

// GET /stores/:id - View a single store and its dresses
router.get('/:id', async (req, res) => {
    try {
        const storeId = req.params.id;
        const store = await Store.findById(storeId);
        if (!store) {
            req.flash('error', 'Store not found.');
            return res.status(404).redirect('/');
        }

        const dresses = await Dress.find({ store: storeId });

        res.render('storeDetails', {
            store: store,
            dresses: dresses,
            title: store.name // Correctly passing 'title'
        });
    } catch (err) {
        console.error('Error fetching store details:', err);
        // This catch block might also catch Mongoose CastError if ID is malformed
        req.flash('error', 'Error loading store details or invalid ID.');
        res.status(500).redirect('/');
    }
});

module.exports = router;