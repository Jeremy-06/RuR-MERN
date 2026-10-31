import { useState, useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import EmptyState from '../Layout/EmptyState'
import SectionTitle from '../Layout/SectionTitle'
import QuantitySelector from '../Layout/QuantitySelector'
import ProductGallery from './ProductGallery'

import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import ListReviews from '../Review/ListReviews';

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'

import { successMsg, errMsg, formatMoney, LOW_STOCK } from '../Utils/helpers'
import { accentTop } from '../../theme'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'

const ProductDetails = () => {
    const { loading, error, product } = useSelector(state => state.productDetails);
    const { user } = useSelector(state => state.auth)
    const [quantity, setQuantity] = useState(1)
    const [rating, setRating] = useState(0)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [comment, setComment] = useState('')
    const [reviews, setReviews] = useState([])
    // canReview: has a delivered order with this product; myReview: their existing review, if any
    const [reviewStatus, setReviewStatus] = useState({ canReview: false, myReview: null })
    // Bumped after saving a review so both lists load again
    const [reviewsVersion, setReviewsVersion] = useState(0)
    let { id } = useParams()
    const dispatch = useDispatch()

    const increaseQty = () => {
        if (quantity >= product.stock) return;
        setQuantity(quantity + 1)
    }

    const decreaseQty = () => {
        if (quantity <= 1) return;
        setQuantity(quantity - 1)
    }

    const addToCart = async () => {
        dispatch(addItemToCart(id, quantity));
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    }

    // Opening the form for an existing review starts from what they wrote
    const openReviewForm = () => {
        const { myReview } = myReviewStatus
        setRating(myReview ? myReview.rating : 0)
        setComment(myReview ? myReview.comment : '')
        setReviewOpen(true)
    }

    // New review is a POST; editing their own review is a PUT
    const saveReview = async (reviewData) => {
        const { myReview } = myReviewStatus
        try {
            const { data } = myReview
                ? await axios.put(`${import.meta.env.VITE_API}/review/${myReview._id}`, reviewData, config)
                : await axios.post(`${import.meta.env.VITE_API}/review`, reviewData, config)
            if (data.success) {
                successMsg(myReview ? 'Review updated successfully' : 'Review posted successfully')
                setReviewOpen(false)
                setRating(0)
                setComment('')
                dispatch(getProductDetails(id))
                setReviewsVersion(version => version + 1)
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const reviewHandler = () => {
        if (rating === 0 || !comment.trim()) {
            errMsg('Please choose a rating and write a comment')
            return
        }
        saveReview({
            rating,
            comment,
            productId: id
        })
    }

    useEffect(() => {
        dispatch(getProductDetails(id))
        setQuantity(1)
    }, [dispatch, id]);

    useEffect(() => {
        let ignore = false
        axios.get(`${import.meta.env.VITE_API}/reviews?id=${id}`)
            .then(({ data }) => { if (!ignore) setReviews(data.reviews) })
            .catch(error => { if (!ignore) errMsg(error.response ? error.response.data.message : error.message) })
        return () => { ignore = true }
    }, [id, reviewsVersion])

    useEffect(() => {
        if (!user) return
        let ignore = false
        axios.get(`${import.meta.env.VITE_API}/review/me?productId=${id}`, { withCredentials: true })
            .then(({ data }) => { if (!ignore) setReviewStatus({ canReview: data.canReview, myReview: data.review }) })
            .catch(() => { if (!ignore) setReviewStatus({ canReview: false, myReview: null }) })
        return () => { ignore = true }
    }, [id, user, reviewsVersion])

    // A logged out visitor has no review status, whatever was loaded before
    const myReviewStatus = user ? reviewStatus : { canReview: false, myReview: null }

    useEffect(() => {
        if (error) {
            errMsg(error)
        }
    }, [error])

    if (error) return <Box sx={{ mt: 5 }}><EmptyState icon={<ErrorOutlinedIcon />} title={error} /></Box>
    if (loading || product._id !== id) return <Loader />

    const inStock = product.stock > 0
    const lowStock = inStock && product.stock <= LOW_STOCK
    const reviewCount = product.reviewCount || 0
    const reviewTitle = myReviewStatus.myReview ? 'Edit Review' : 'Submit Review'

    let stockLabel = 'Sold out'
    if (lowStock) stockLabel = `Low stock - only ${product.stock} left`
    else if (inStock) stockLabel = `In stock - ${product.stock} available`

    return (
        <>
            <MetaData title={product.name} />
            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 3, md: 4 },
                    mt: { xs: 3, md: 5 },
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 7fr) minmax(0, 5fr)' },
                    gridTemplateRows: { sm: 'auto 1fr' },
                    gridTemplateAreas: {
                        xs: '"gallery" "buy" "description"',
                        sm: '"gallery buy" "description buy"',
                    },
                }}
            >
                <Box sx={{ gridArea: 'gallery', minWidth: 0 }}>
                    <ProductGallery key={product._id} images={product.images} name={product.name} />
                </Box>

                <Box sx={{ gridArea: 'buy', minWidth: 0 }}>
                    <Card sx={{ ...accentTop, height: 'auto', p: 3, position: { sm: 'sticky' }, top: { sm: 96 } }}>
                        <Typography variant="overline" component="p" sx={{ color: 'primary.dark' }}>{product.category}</Typography>
                        <Typography variant="h2" component="h1" sx={{ overflowWrap: 'anywhere' }}>{product.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>Product # {product._id}</Typography>

                        {reviewCount > 0 ? (
                            <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                                <Rating value={product.averageRating} precision={0.1} readOnly aria-label={`${product.averageRating} out of 5 stars`} />
                                <Link href="#reviews" variant="body2" sx={{ color: 'primary.dark' }}>
                                    {product.averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})
                                </Link>
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>No reviews yet</Typography>
                        )}

                        <Typography variant="h1" component="p" sx={{ mt: 2 }}>{formatMoney(product.price)}</Typography>

                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 1, color: !inStock || lowStock ? 'error.main' : 'success.main' }}>
                            {inStock && !lowStock ? <CheckCircleOutlinedIcon fontSize="small" /> : <ErrorOutlinedIcon fontSize="small" />}
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{stockLabel}</Typography>
                        </Stack>

                        <Stack direction="row" sx={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
                            <QuantitySelector quantity={quantity} stock={product.stock} onDecrease={decreaseQty} onIncrease={increaseQty} />
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddShoppingCartIcon />}
                                disabled={!inStock}
                                onClick={addToCart}
                                sx={{ flexGrow: 1 }}
                            >
                                Add to Cart
                            </Button>
                        </Stack>

                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                            Sold by: <Box component="strong" sx={{ color: 'text.primary' }}>{product.seller}</Box>
                        </Typography>
                    </Card>
                </Box>

                <Box sx={{ gridArea: 'description', minWidth: 0 }}>
                    <SectionTitle>Description</SectionTitle>
                    <Typography color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{product.description}</Typography>
                </Box>
            </Box>

            <Box component="section" id="reviews" aria-labelledby="reviews-title" sx={{ mt: 6, scrollMarginTop: 96 }}>
                <SectionTitle id="reviews-title" sx={{ mb: 3 }}>Customer Reviews</SectionTitle>

                <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
                    <Grid size={{ xs: 12, md: reviews.length > 0 ? 4 : 12 }}>
                        <Card sx={{ ...accentTop, height: 'auto', p: 3 }}>
                            {reviewCount > 0 ? (
                                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h1" component="p">{product.averageRating.toFixed(1)}</Typography>
                                    <Box>
                                        <Rating value={product.averageRating} precision={0.1} readOnly aria-label={`${product.averageRating} out of 5 stars`} />
                                        <Typography variant="body2" color="textSecondary">
                                            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography variant="h5" component="p">No reviews yet</Typography>
                            )}

                            {reviews.length > 0 && (
                                <Stack spacing={0.75} sx={{ mt: 2.5 }}>
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = reviews.filter(review => review.rating === star).length
                                        return (
                                            <Stack key={star} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ width: 28, fontWeight: 700 }}>{star}<Box component="span" aria-hidden="true" sx={{ color: '#faaf00' }}> &#9733;</Box></Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(count / reviews.length) * 100}
                                                    aria-label={`${count} ${star} star reviews`}
                                                    sx={{ flexGrow: 1, height: 8, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                                                />
                                                <Typography variant="body2" color="textSecondary" sx={{ width: 20, textAlign: 'right' }}>{count}</Typography>
                                            </Stack>
                                        )
                                    })}
                                </Stack>
                            )}

                            <Box sx={{ mt: 3 }}>
                                {!user ? (
                                    <Alert severity="info" action={<Button color="inherit" size="small" component={RouterLink} to={`/login?redirect=product/${id}`}>Login</Button>}>
                                        Login to post your review.
                                    </Alert>
                                ) : myReviewStatus.myReview || myReviewStatus.canReview ? (
                                    <Button variant="contained" fullWidth onClick={openReviewForm}>
                                        {myReviewStatus.myReview ? 'Edit Your Review' : 'Submit Your Review'}
                                    </Button>
                                ) : (
                                    <Alert severity="info">You can review this product once an order with it has been delivered.</Alert>
                                )}
                            </Box>
                        </Card>
                    </Grid>

                    {reviews.length > 0 && (
                        <Grid size={{ xs: 12, md: 8 }}>
                            <ListReviews reviews={reviews} />
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} fullWidth maxWidth="sm" aria-labelledby="review-dialog-title">
                <DialogTitle id="review-dialog-title">{reviewTitle}</DialogTitle>
                <DialogContent>
                    <Typography id="review-rating-label" variant="body2" color="textSecondary">Your rating</Typography>
                    <Rating
                        name="review-rating"
                        aria-labelledby="review-rating-label"
                        size="large"
                        value={rating}
                        onChange={(e, value) => setRating(value || 0)}
                    />
                    <TextField
                        label="Your review"
                        multiline
                        minRows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 1000 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setReviewOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={reviewHandler}>Submit</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ProductDetails
