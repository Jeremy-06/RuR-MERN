const Product = require('../models/product')
const Order = require('../models/order')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');

const uploadImages = async (images) => {
    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'rur/products',
            width: 500,
            crop: "scale",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    return imagesLinks
}

exports.newProduct = async (req, res, next) => {
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images || []
    }

    req.body.images = await uploadImages(images)
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    if (!product)
        return res.status(400).json({
            success: false,
            message: 'Product not created'
        })

    return res.status(201).json({
        success: true,
        product
    })
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getProducts = async (req, res) => {
    const resPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
    const filteredProductsCount = await apiFeatures.query.clone().countDocuments();

    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,
    })
}

exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images || []
    }

    // Replace images only when new ones were chosen
    if (images.length > 0) {
        for (const image of product.images) {
            if (image.public_id.startsWith('rur/products')) {
                await cloudinary.v2.uploader.destroy(image.public_id)
            }
        }
        req.body.images = await uploadImages(images)
    } else {
        delete req.body.images
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true,
    })
    return res.status(200).json({
        success: true,
        product
    })
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

exports.getAdminProducts = async (req, res, next) => {
    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })
}

exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);
    if (!product)
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = Number(rating);
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true
    })
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product)
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product)
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;
    const ratings = numOfReviews > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews
        : 0

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        returnDocument: 'after',
        runValidators: true,
    })

    return res.status(200).json({
        success: true
    })
}

exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }
            },
        },
    ])

    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])

    const grandTotal = totalSales.length > 0 ? totalSales[0].total : 0
    const totalPercentage = sales.map(item => {
        const percent = grandTotal > 0 ? Number(((item.total / grandTotal) * 100).toFixed(2)) : 0
        return {
            name: item._id.product,
            percent
        }
    })

    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })
}
