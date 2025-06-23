// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your User model
const bcrypt = require('bcryptjs'); // For password hashing (npm install bcryptjs)

// GET /auth/login - Display login form
router.get('/login', (req, res) => {
    // Ensure you have Frontend/views/auth/login.ejs
    res.render('login', { title: 'User Login' }); // Updated path to 'auth/login'
});

// GET /auth/signup - Display signup form
router.get('/signup', (req, res) => {
    // Ensure you have Frontend/views/auth/signup.ejs
    res.render('signup', { title: 'Register Account' }); // Updated path to 'auth/signup'
});

// POST /auth/signup - Handle User Registration (MODIFIED)
router.post('/signup', async (req, res) => {
    // Destructure all fields from req.body, including new ones
    const { username, email, mobileNumber, password, role } = req.body; // Added mobileNumber and role

    // Basic validation for required fields
    if (!username || !email || !password) { // mobileNumber and role are handled below if not required
        req.flash('error', 'Please fill in all required fields (username, email, password).');
        return res.redirect('signup');
    }

    // Validate 10-digit mobile number if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
        req.flash('error', 'Please enter a valid 10-digit mobile number.');
        return res.redirect('signup');
    }

    try {
        // Check for existing user by email or username
        let userByEmail = await User.findOne({ email: email.toLowerCase() }); // Always store/compare emails lowercase
        if (userByEmail) {
            req.flash('error', 'User with this email already exists.');
            return res.redirect('signup');
        }

        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            req.flash('error', 'Username already taken.');
            return res.redirect('signup');
        }

        // Check for existing user by mobile number if provided
        if (mobileNumber) {
            let userByMobile = await User.findOne({ mobileNumber });
            if (userByMobile) {
                req.flash('error', 'User with this mobile number already exists.');
                return res.redirect('signup');
            }
        }

        // Create new user instance
        const newUser = new User({
            username,
            email: email.toLowerCase(), // Store email in lowercase
            mobileNumber: mobileNumber || undefined, // Store mobileNumber if provided, or undefined
            password, // Password will be hashed by pre-save hook in User model
            role: role || 'user' // Use the role from the form, default to 'user' if not provided
        });

        await newUser.save();

        // Log the user in immediately after signup (using direct session management)
        req.session.user = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            mobileNumber: newUser.mobileNumber, // Include mobileNumber in session
            role: newUser.role // Make sure 'role' is included
        };

        req.flash('success', 'Account created successfully! You are now logged in.');
        res.redirect('/');
    } catch (error) {
        console.error('Signup error:', error);
        // Handle Mongoose validation errors or other general errors
        let errorMessage = 'An error occurred during registration. Please try again.';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(' ');
        } else if (error.code === 11000) { // Duplicate key error
             errorMessage = 'A user with this email, username, or mobile number already exists.';
        }
        req.flash('error', errorMessage);
        res.redirect('signup');
    }
});

// POST /auth/login - Handle User Login (MODIFIED)
router.post('/login', async (req, res) => {
    // Expect 'identifier' which can be email or mobile number
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        req.flash('error', 'Please enter your mobile number/email and password.');
        return res.redirect('login');
    }

    try {
        let user;
        // Check if the identifier looks like an email (contains '@')
        if (identifier.includes('@')) {
            user = await User.findOne({ email: identifier.toLowerCase() }); // Match email
        } else {
            // Assume it's a mobile number, or check if it matches a 10-digit pattern
            // You might want a stricter regex here if mobileNumber is always 10 digits
            if (/^\d{10}$/.test(identifier)) { // Basic check for 10 digits
                 user = await User.findOne({ mobileNumber: identifier }); // Match mobile number
            } else {
                 // If it's not an email and not a 10-digit number, it's an invalid identifier
                 req.flash('error', 'Please enter a valid email or 10-digit mobile number.');
                 return res.redirect('login');
            }
        }

        if (!user) {
            req.flash('error', 'Invalid mobile number/email or password.');
            return res.redirect('login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid mobile number/email or password.');
            return res.redirect('login');
        }

        // Set user data in session upon successful login
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            mobileNumber: user.mobileNumber, // Include mobileNumber in session
            role: user.role
        };

        req.flash('success', `Welcome back, ${user.username}!`);
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('login');
    }
});

// GET or POST /auth/logout - Handle User Logout (NO CHANGE)
// GET or POST /auth/logout - Handle User Logout
router.get('/logout', (req, res) => {
    // Before destroying the session, store flash messages
    // This is the line where req.flash() is called
    req.flash('success', 'You have been logged out.'); // Line 161 in your original error based on context

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            // If session destruction fails, you might still want to clear the cookie
            res.clearCookie('connect.sid');
            req.flash('error', 'Error logging out.'); // This flash might not work if session is already gone
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        // After session is destroyed, flash messages stored BEFORE destroy() are typically still available for the redirect
        res.redirect('/');
    });
});

module.exports = router;