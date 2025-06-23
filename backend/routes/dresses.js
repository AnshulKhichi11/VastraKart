// backend/routes/dresses.js

const express = require('express');
const router = express.Router();
const Dress = require('../models/Dress');
const Store = require('../models/Store');
const { isStoreOwner } = require('../middleware/authMiddleware'); // Import authorization middleware

// GET /dresses/add/:storeId - Display form to add a new dress to a specific store
// Protected: Only store owners can access
router.get('/add/:storeId', isStoreOwner, async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const store = await Store.findById(storeId);
        if (!store) {
            req.flash('error', 'Store not found for adding dress.');
            return res.status(404).redirect('/');
        }
        res.render('addDress', {
            title: `Add Dress to ${store.name}`, // Correctly passing 'title'
            store: store,
        });
    } catch (err) {
        console.error('Error fetching store for adding dress:', err);
        req.flash('error', 'Error loading dress addition form.');
        res.status(500).redirect('/');
    }
});


// POST /dresses/add - Handle submission of new dress form
// Protected: Only store owners can submit
router.post('/add', isStoreOwner, async (req, res) => {
    try {
        const { name, storeId, price, description, mainImage, otherImages, category, sizes, colors } = req.body;

        // Basic validation
        if (!name || !storeId || !price || !mainImage) {
            req.flash('error', 'Please fill in all required fields (Name, Store, Price, Main Image).');
            return res.status(400).redirect(`/dresses/add/${storeId}`);
        }

        // Optional: Verify store exists and belongs to logged-in owner (if applicable in your Store model)
        const store = await Store.findById(storeId);
        if (!store) {
             req.flash('error', 'Invalid store selected.');
             return res.status(400).redirect('/');
        }
        // Example check if Store model had an owner field:
        // if (store.owner.toString() !== req.session.user.id) {
        //     req.flash('error', 'You are not authorized to add dresses to this store.');
        //     return res.status(403).redirect('/');
        // }


        const newDress = new Dress({
            name,
            store: storeId,
            price,
            description,
            mainImage,
            otherImages: otherImages ? otherImages.split(',').map(img => img.trim()) : [],
            category,
            sizes: Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []),
            colors: Array.isArray(colors) ? colors : (colors ? [colors] : [])
        });
        await newDress.save();
        req.flash('success', 'Dress added successfully!');
        res.redirect(`/stores/${storeId}`);
    } catch (err) {
        console.error('Error adding dress:', err);
        req.flash('error', 'Error adding dress. Please try again.');
        // Redirect back to the form if storeId is available, otherwise homepage
        if (req.body.storeId) {
             return res.status(500).redirect(`/dresses/add/${req.body.storeId}`);
        }
        res.status(500).redirect('/');
    }
});

// GET /dresses/:id - View a single dress
router.get('/:id', async (req, res) => {
  try {
    const dress = await Dress.findById(req.params.id).populate('store'); // Populate store details
    if (!dress) {
      req.flash('error', 'Dress not found.');
      return res.status(404).redirect('/'); // Redirect home on 404
    }

    res.render('dressDetails', { title: dress.name, dress }); // Correctly passing 'title' and 'dress'
  } catch (err) {
    console.error('Error loading dress with ID', req.params.id, ':', err);
    // This often catches Mongoose CastError if req.params.id is not a valid ObjectId format
    req.flash('error', 'Failed to load dress details or invalid ID.');
    res.status(500).redirect('/'); // Redirect home on server error
  }
});

module.exports = router;