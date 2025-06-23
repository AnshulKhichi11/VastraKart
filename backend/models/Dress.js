const mongoose = require('mongoose');

const dressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store', // This links a dress to its parent store
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    mainImage: {
        type: String, // URL for the main display image of the dress
        required: true
    },
    otherImages: [
        {
            type: String // Array of URLs for 4-5 additional images
        }
    ],
    category: {
        type: String, // Example categories
        default: 'Modern'
    },
    sizes: [
        {
            type: String,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'], // Example sizes
            default: 'Free Size'
        }
    ],
    colors: [
        {
            type: String // Example: ['Red', 'Blue', 'Green']
        }
    ],
    // You can add more specific product details like material, brand, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create an index for faster lookups of dresses by store
dressSchema.index({ store: 1 });

module.exports = mongoose.model('Dress', dressSchema);