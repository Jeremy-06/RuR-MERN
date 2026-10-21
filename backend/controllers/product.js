const mongoose = require('mongoose')
const Product = require('../models/product')
const Order = require('../models/order')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');

const PRODUCTS_FOLDER = 'rur/products'

// Streams one multer memory file to Cloudinary
const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({
            folder: PRODUCTS_FOLDER,
            width: 1000,
            crop: "limit",
        }, (error, result) => {
            if (error) return reject(error)
            resolve({
                public_id: result.public_id,
                url: result.secure_url
            })
        })
        stream.end(file.buffer)
    })
}

// Seed and legacy images are not stored in Cloudinary, so only our folder is destroyed
const destroyImages = async (images = []) => {
    const cloudinaryImages = images.filter(image => image.public_id && image.public_id.startsWith(`${PRODUCTS_FOLDER}/`))
    await Promise.all(cloudinaryImages.map(image => cloudinary.v2.uploader.destroy(image.public_id)))
}

const uploadImages = async (files = []) => {
    let imagesLinks = [];

    try {
        for (const file of files) {
            imagesLinks.push(await uploadImage(file))
        }
    } catch (error) {
        // Remove the images that already went up before the failure
        await destroyImages(imagesLinks)
        throw error
    }
    return imagesLinks
}

exports.newProduct = async (req, res, next) => {
    const product = new Product({ ...req.body, images: [], user: req.user.id })

    // Validate before uploading so a bad form does not leave images in Cloudinary
    await product.validate()
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload at least one product image'
        })
    }
    product.images = await uploadImages(req.files)

    try {
        await product.save()
    } catch (error) {
        await destroyImages(product.images)
        return next(error)
    }

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

// Categories come from the model enum, same list the admin form uses
const productCategories = () => Product.schema.path('category').enumValues

exports.getCategories = async (req, res, next) => {
    return res.status(200).json({
        success: true,
        categories: productCategories()
    })
}

// http://localhost:4002/api/v1/products?page=2&limit=12&minPrice=10&maxPrice=200&category=Mice&category=Headsets
exports.getProducts = async (req, res) => {
    const errorMessage = APIFeatures.validateShopQuery(req.query, productCategories())
    if (errorMessage) {
        return res.status(400).json({
            success: false,
            message: errorMessage
        })
    }

    const resPerPage = Number(req.query.limit) || 12;
    const currentPage = Number(req.query.page) || 1;
    const productsCount = await Product.countDocuments();

    // One query: search + filters, counted before paging so the total matches the filters
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
    const filteredProductsCount = await apiFeatures.query.clone().countDocuments();

    apiFeatures.sort().pagination(resPerPage);
    const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,
        currentPage,
        hasMore: currentPage * resPerPage < filteredProductsCount,
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

    // public_ids of existing images the admin removed
    let removeImages = req.body.removeImages || []
    if (typeof removeImages === 'string') {
        removeImages = [removeImages]
    }
    const removedImages = product.images.filter(image => removeImages.includes(image.public_id))
    const keptImages = product.images.filter(image => !removeImages.includes(image.public_id))

    delete req.body.removeImages
    delete req.body.images
    product.set(req.body)
    await product.validate()
    if (keptImages.length + (req.files ? req.files.length : 0) === 0) {
        return res.status(400).json({
            success: false,
            message: 'A product needs at least one image'
        })
    }

    // New images are added to the ones that were kept
    const newImages = await uploadImages(req.files)
    product.images = [...keptImages, ...newImages]

    try {
        await product.save()
    } catch (error) {
        await destroyImages(newImages)
        return next(error)
    }
    await destroyImages(removedImages)

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
    await destroyImages(product.images)

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

exports.deleteProducts = async (req, res, next) => {
    const { ids } = req.body || {}

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please select at least one product'
        })
    }
    if (!ids.every(id => mongoose.isValidObjectId(id))) {
        return res.status(400).json({
            success: false,
            message: 'Invalid product id in the selection'
        })
    }

    const products = await Product.find({ _id: { $in: ids } })
    if (products.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }

    const { deletedCount } = await Product.deleteMany({ _id: { $in: products.map(product => product._id) } })
    await destroyImages(products.flatMap(product => product.images))

    return res.status(200).json({
        success: true,
        deletedCount,
        message: `${deletedCount} product(s) deleted`
    })
}

// Serves the DataTables admin table; without DataTables params it returns every product (dashboard)
exports.getAdminProducts = async (req, res, next) => {
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).dataTableSearch(['name', 'category'])
    const filteredProductsCount = await apiFeatures.query.clone().countDocuments();

    apiFeatures.dataTableSort(['name', 'category', 'price', 'stock', 'createdAt']).dataTablePagination()
    const products = await apiFeatures.query;

    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        draw: Number(req.query.draw) || 0,
        products,
        productsCount,
        filteredProductsCount,
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
