const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Ensure store names are unique
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String, // URL to the store logo
        required: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        // If you have a User model and want to link stores to specific users
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model (if you have one)
        // required: true // Uncomment if every store must have an owner
    },
    // You can add more fields like contact, website, social links etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Store', storeSchema);