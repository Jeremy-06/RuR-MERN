const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    newProduct,
    getSingleProduct,
    getProducts,
    getCategories,
    updateProduct,
    deleteProduct,
    deleteProducts,
    getAdminProducts,
    createProductReview,
    getProductReviews,
    deleteReview,
    productSales,
} = require('../controllers/product');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), newProduct);
router.get('/product/:id', getSingleProduct)
router.get('/products', getProducts)
router.get('/categories', getCategories)
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 10), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/admin/products')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProducts)
router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/reviews', isAuthenticatedUser, getProductReviews)
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview)
router.get('/admin/product-sales', isAuthenticatedUser, authorizeRoles('admin'), productSales);
module.exports = router
