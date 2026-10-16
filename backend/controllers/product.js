const mongoose = require('mongoose');
const Product = require('../models/product');

exports.listProducts = async (req, res) => {
    const products = await Product.find().sort({ featured: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, products });
};

exports.createProduct = async (req, res) => {
    const { name, description, category, price, stock, image, featured } = req.body;
    const product = await Product.create({ name, description, category, price, stock, image, featured });
    res.status(201).json({ success: true, product });
};

exports.updateProduct = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    const updates = {};
    for (const field of ['name', 'description', 'category', 'price', 'stock', 'image', 'featured']) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (!Object.keys(updates).length) {
        return res.status(400).json({ message: 'Provide at least one product field to update.' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
        returnDocument: 'after',
        runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(200).json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(200).json({ success: true, id: product.id });
};
