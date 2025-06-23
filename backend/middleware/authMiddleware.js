// backend/middleware/authMiddleware.js

const isStoreOwner = (req, res, next) => {
    // 1. Check if user is logged in
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/auth/login');
    }

    // 2. Check if the logged-in user has the 'store_owner' role
    if (req.session.user.role === 'store_owner') {
        next(); // User is a store owner, proceed
    } else {
        req.flash('error', 'You are not authorized to perform this action. Only store owners can add dresses.');
        return res.status(403).redirect('/'); // Redirect to homepage with unauthorized message
    }
};

const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.flash('error', 'You must be logged in to view this page.');
        return res.redirect('/auth/login');
    }
};

module.exports = {
    isStoreOwner,
    isLoggedIn
};