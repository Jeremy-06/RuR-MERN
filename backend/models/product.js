const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Product price cannot be negative'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    // Kept up to date by the Review model hooks
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Keyboards',
                'Mice',
                'Headsets',
                'Speakers',
                'Monitors',
                'Controllers',
                'Chairs',
                'Desks',
                'Mousepads',
                'Microphones',
                'Webcams',
                'Lighting',
                'Components',
                'Accessories'
            ],
            message: 'Please select correct category for product'
        }
    },
    // Optional: the admin form only asks for the fields in the product spec
    seller: {
        type: String,
        default: 'RuR Gear'
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Product stock cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Product stock must be a whole number'
        },
        default: 0
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Shop list filters on rating and review count
productSchema.index({ averageRating: -1, reviewCount: -1 })

module.exports = mongoose.model('Product', productSchema);
