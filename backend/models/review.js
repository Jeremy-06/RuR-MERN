const mongoose = require('mongoose')
const { isProfane } = require('../utils/profanity')

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please choose a rating'],
        min: [1, 'Rating must be from 1 to 5'],
        max: [5, 'Rating must be from 1 to 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number from 1 to 5'
        }
    },
    comment: {
        type: String,
        required: [true, 'Please write a comment'],
        trim: true,
        maxLength: [1000, 'Comment cannot exceed 1000 characters'],
        validate: {
            // Block imbes na i-mask para mabago ng customer
            validator: value => !isProfane(value),
            message: 'Please remove offensive language from your review'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
})

// Isang review lang kada customer kada product
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

reviewSchema.statics.updateProductRating = async function (productId) {
    const [stats] = await this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
        { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ])

    await mongoose.model('Product').findByIdAndUpdate(productId, {
        // One decimal para magtugma ang stars at rating filter
        averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
        reviewCount: stats ? stats.reviewCount : 0
    })
}

reviewSchema.pre('save', function () {
    if (!this.isNew && this.isModified()) this.updatedAt = Date.now()
})

// Tumatakbo after save() at deleteOne()
reviewSchema.post('save', async function () {
    await this.constructor.updateProductRating(this.product)
})

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.updateProductRating(this.product)
})

module.exports = mongoose.model('Review', reviewSchema)
