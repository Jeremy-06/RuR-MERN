const mongoose = require('mongoose')
const Review = require('../models/review')
const Product = require('../models/product')
const Order = require('../models/order')

// Delivered lang ang pwedeng mag-review
const COMPLETED_ORDER_STATUS = 'Delivered'

const hasCompletedOrder = (userId, productId) => Order.exists({
    user: userId,
    orderStatus: COMPLETED_ORDER_STATUS,
    'orderItems.product': productId
})

const notFound = (res, message) => res.status(404).json({ success: false, message })

exports.createReview = async (req, res, next) => {
    const { productId, rating, comment } = req.body

    if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
        return notFound(res, 'Product not found')
    }

    if (!(await hasCompletedOrder(req.user._id, productId))) {
        return res.status(403).json({
            success: false,
            message: 'You can only review products from your delivered orders'
        })
    }

    if (await Review.exists({ product: productId, user: req.user._id })) {
        return res.status(409).json({
            success: false,
            message: 'You already reviewed this product, edit your review instead'
        })
    }

    // Nasa model hooks ang bad-words masking at rating update
    const review = await Review.create({
        user: req.user._id,
        product: productId,
        rating: Number(rating),
        comment
    })

    return res.status(201).json({
        success: true,
        review,
        masked: Boolean(review.$locals.masked)
    })
}

exports.updateReview = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res, 'Review not found')

    const review = await Review.findById(req.params.id)
    if (!review) return notFound(res, 'Review not found')

    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You can only edit your own reviews'
        })
    }

    if (req.body.rating !== undefined) review.rating = Number(req.body.rating)
    if (req.body.comment !== undefined) review.comment = req.body.comment
    await review.save()

    return res.status(200).json({
        success: true,
        review,
        masked: Boolean(review.$locals.masked)
    })
}

exports.deleteReview = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res, 'Review not found')

    const review = await Review.findById(req.params.id)
    if (!review) return notFound(res, 'Review not found')

    await review.deleteOne()

    return res.status(200).json({
        success: true,
        message: 'Review deleted'
    })
}

exports.getProductReviews = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.query.id)) return notFound(res, 'Product not found')

    const reviews = await Review.find({ product: req.query.id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })

    return res.status(200).json({
        success: true,
        reviews
    })
}

exports.getMyReview = async (req, res, next) => {
    const { productId } = req.query
    if (!mongoose.isValidObjectId(productId)) return notFound(res, 'Product not found')

    const [review, canReview] = await Promise.all([
        Review.findOne({ product: productId, user: req.user._id }),
        hasCompletedOrder(req.user._id, productId)
    ])

    return res.status(200).json({
        success: true,
        canReview: Boolean(canReview),
        review
    })
}
