import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { Carousel } from 'react-bootstrap'

import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import ListReviews from '../Review/ListReviews';

import { successMsg, errMsg } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails } from '../../actions/productActions'

const ProductDetails = ({ addItemToCart }) => {
    const { loading, error, product } = useSelector(state => state.productDetails);
    const { user } = useSelector(state => state.auth)
    const [quantity, setQuantity] = useState(1)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
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
        await addItemToCart(id, quantity);
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

    if (error) return <h2 className="mt-5 text-center">{error}</h2>
    if (loading || product._id !== id) return <Loader />

    return (
        <>
            <MetaData title={product.name} />
            <div className="row d-flex justify-content-around">
                <div className="col-12 col-lg-5 img-fluid" id="product_image">
                    <Carousel pause='hover'>
                        {product.images && product.images.map(image => (
                            <Carousel.Item key={image.public_id + image.url}>
                                <img className="d-block w-100" src={image.url} alt={product.name} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>

                <div className="col-12 col-lg-5 mt-5">
                    <span className="card-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p id="product_id">Product # {product._id}</p>

                    <hr />

                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(product.averageRating / 5) * 100}%` }}></div>
                    </div>
                    <span id="no_of_reviews">{product.averageRating > 0 && `${product.averageRating.toFixed(1)} `}({product.reviewCount} Reviews)</span>

                    <hr />

                    <p id="product_price">${product.price}</p>
                    <div className="stockCounter d-inline">
                        <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

                        <input type="number" className="form-control count d-inline" value={quantity} readOnly />

                        <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                    </div>

                    <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4" disabled={product.stock === 0} onClick={addToCart} >Add to Cart</button>
                    <hr />

                    <p>Status: <span id="stock_status" className={product.stock > 0 ? 'greenColor' : 'redColor'} >{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>

                    <hr />

                    <h4 className="mt-2">Description:</h4>
                    <p>{product.description}</p>
                    <hr />
                    <p id="product_seller" className="mb-3">Sold by: <strong>{product.seller}</strong></p>

                    {!user ? (
                        <div className="alert alert-danger mt-5" type='alert'>Login to post your review.</div>
                    ) : myReviewStatus.myReview || myReviewStatus.canReview ? (
                        <button id="review_btn" type="button" className="btn btn-primary mt-4" data-toggle="modal" data-target="#ratingModal" onClick={openReviewForm}>
                            {myReviewStatus.myReview ? 'Edit Your Review' : 'Submit Your Review'}
                        </button>
                    ) : (
                        <div className="alert alert-info mt-5" type='alert'>You can review this product once an order with it has been delivered.</div>
                    )}

                    <div className="row mt-2 mb-5">
                        <div className="rating w-50">
                            <div className="modal fade" id="ratingModal" tabIndex="-1" role="dialog" aria-labelledby="ratingModalLabel" aria-hidden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="ratingModalLabel">{myReviewStatus.myReview ? 'Edit Review' : 'Submit Review'}</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <ul className="stars" onMouseLeave={() => setHoverRating(0)}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <li
                                                        key={star}
                                                        className={`star ${star <= rating ? 'orange' : ''} ${star <= hoverRating ? 'yellow' : ''}`}
                                                        onClick={() => setRating(star)}
                                                        onMouseOver={() => setHoverRating(star)}
                                                    >
                                                        <i className="fa fa-star"></i>
                                                    </li>
                                                ))}
                                            </ul>

                                            <textarea
                                                name="review"
                                                id="review" className="form-control mt-3"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            >
                                            </textarea>

                                            <button className="btn my-3 float-right review-btn px-4 text-white" data-dismiss="modal" aria-label="Close" onClick={reviewHandler} >Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {reviews.length > 0 && (
                <ListReviews reviews={reviews} />
            )}
        </>
    )
}

export default ProductDetails
