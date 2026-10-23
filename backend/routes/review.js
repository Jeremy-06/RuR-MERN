const express = require('express')
const router = express.Router();

const {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getMyReview,
} = require('../controllers/review')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

router.get('/reviews', getProductReviews);
router.get('/review/me', isAuthenticatedUser, getMyReview);
router.post('/review', isAuthenticatedUser, createReview);
router.put('/review/:id', isAuthenticatedUser, updateReview);
router.delete('/admin/review/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteReview);
module.exports = router;
