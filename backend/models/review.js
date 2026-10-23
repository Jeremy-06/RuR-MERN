const mongoose = require('mongoose')
const { Filter } = require('bad-words')

const profanityFilter = new Filter()

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
            // Blocked instead of masked so the customer can reword it
            validator: value => !profanityFilter.isProfane(value),
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

// One review per customer per product; they edit it instead of posting again
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Recalculates averageRating and reviewCount on the product from its reviews
reviewSchema.statics.updateProductRating = async function (productId) {
    const [stats] = await this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
        { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ])

    await mongoose.model('Product').findByIdAndUpdate(productId, {
        // Rounded to one decimal so the stars shown and the rating filter agree
        averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
        reviewCount: stats ? stats.reviewCount : 0
    })
}

reviewSchema.pre('save', function () {
    if (!this.isNew && this.isModified()) this.updatedAt = Date.now()
})

// Runs after create/update (review.save()) and delete (review.deleteOne())
reviewSchema.post('save', async function () {
    await this.constructor.updateProductRating(this.product)
})

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.updateProductRating(this.product)
})

module.exports = mongoose.model('Review', reviewSchema)
