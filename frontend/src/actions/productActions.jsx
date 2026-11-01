import axios from 'axios';
import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_FAIL,
    GET_REVIEWS_REQUEST,
    GET_REVIEWS_SUCCESS,
    GET_REVIEWS_FAIL,
    DELETE_REVIEW_REQUEST,
    DELETE_REVIEW_SUCCESS,
    DELETE_REVIEW_FAIL,
    MY_REVIEW_REQUEST,
    MY_REVIEW_SUCCESS,
    MY_REVIEW_FAIL,
    SEARCH_SUGGESTIONS_REQUEST,
    SEARCH_SUGGESTIONS_SUCCESS,
    SEARCH_SUGGESTIONS_FAIL,
    SEARCH_SUGGESTIONS_CLEAR,
    TOP_RATED_PRODUCTS_REQUEST,
    TOP_RATED_PRODUCTS_SUCCESS,
    TOP_RATED_PRODUCTS_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

export const RES_PER_PAGE = 12
const TOP_RATED_COUNT = 4

// Same filters always give the same key, so old answers can be told apart
export const productsKey = ({ keyword = '', minPrice = '', maxPrice = '', categories = [], minRating = '' }) =>
    JSON.stringify([keyword, minPrice, maxPrice, [...categories].sort(), minRating])

// Loads one page of the shop list; page 1 starts a new list for these filters
export const getProducts = (filters, currentPage = 1) => async (dispatch, getState) => {
    const key = productsKey(filters)
    const { products: state } = getState()

    // Only one request for the same page at a time, and only the next page
    if (state.loading && state.key === key && state.requestedPage === currentPage) return
    if (currentPage > 1 && (state.loading || state.key !== key || !state.hasMore || currentPage !== state.page + 1)) return

    try {
        dispatch({
            type: ALL_PRODUCTS_REQUEST,
            key,
            page: currentPage
        })

        const params = new URLSearchParams()
        params.set('page', currentPage)
        params.set('limit', RES_PER_PAGE)
        if (filters.keyword) params.set('keyword', filters.keyword)
        if (filters.minPrice !== '') params.set('minPrice', filters.minPrice)
        if (filters.maxPrice !== '') params.set('maxPrice', filters.maxPrice)
        filters.categories.forEach(category => params.append('category', category))
        if (filters.minRating) params.set('minRating', filters.minRating)

        const { data } = await axios.get(`${import.meta.env.VITE_API}/products?${params.toString()}`)
        dispatch({
            type: ALL_PRODUCTS_SUCCESS,
            key,
            payload: data
        })

    } catch (error) {
        dispatch({
            type: ALL_PRODUCTS_FAIL,
            key,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAILS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
        dispatch({
            type: PRODUCT_DETAILS_SUCCESS,
            payload: data.product
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const getAdminProducts = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCTS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, { withCredentials: true })
        dispatch({
            type: ADMIN_PRODUCTS_SUCCESS,
            payload: data.products
        })
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCTS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// The keyword travels with each action so the reducer can drop late answers
export const getSearchSuggestions = (keyword) => async (dispatch) => {
    try {
        dispatch({ type: SEARCH_SUGGESTIONS_REQUEST, keyword })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/products/suggest`, { params: { keyword } })
        dispatch({
            type: SEARCH_SUGGESTIONS_SUCCESS,
            keyword,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: SEARCH_SUGGESTIONS_FAIL,
            keyword,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearSearchSuggestions = () => async (dispatch) => {
    dispatch({
        type: SEARCH_SUGGESTIONS_CLEAR
    })
}

// The shop list has no rating sort, so the best of the 4-star products are picked here
export const getTopRatedProducts = () => async (dispatch) => {
    try {
        dispatch({ type: TOP_RATED_PRODUCTS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/products`, { params: { minRating: 4, limit: 50 } })
        dispatch({
            type: TOP_RATED_PRODUCTS_SUCCESS,
            payload: [...data.products]
                .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
                .slice(0, TOP_RATED_COUNT)
        })
    } catch (error) {
        dispatch({
            type: TOP_RATED_PRODUCTS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// The product id travels with each action so the reducer can drop late answers
export const getProductReviews = (id) => async (dispatch) => {
    try {
        dispatch({ type: GET_REVIEWS_REQUEST, productId: id })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/reviews`, { params: { id } })
        dispatch({
            type: GET_REVIEWS_SUCCESS,
            productId: id,
            payload: data.reviews
        })
    } catch (error) {
        dispatch({
            type: GET_REVIEWS_FAIL,
            productId: id,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// Whether the logged in user can review a product, and their review if they have one
export const getMyReview = (id) => async (dispatch) => {
    try {
        dispatch({ type: MY_REVIEW_REQUEST, productId: id })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/review/me`, { params: { productId: id }, withCredentials: true })
        dispatch({
            type: MY_REVIEW_SUCCESS,
            productId: id,
            payload: data
        })
    } catch {
        dispatch({ type: MY_REVIEW_FAIL, productId: id })
    }
}

// New review is a POST, editing their own review is a PUT; answers whether it was saved
export const newReview = (reviewData, reviewId) => async (dispatch) => {
    try {
        dispatch({ type: NEW_REVIEW_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
        const { data } = reviewId
            ? await axios.put(`${import.meta.env.VITE_API}/review/${reviewId}`, reviewData, config)
            : await axios.post(`${import.meta.env.VITE_API}/review`, reviewData, config)
        dispatch({
            type: NEW_REVIEW_SUCCESS,
            payload: data.success
        })
        return data.success
    } catch (error) {
        dispatch({
            type: NEW_REVIEW_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
        return false
    }
}

export const deleteReview = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_REVIEW_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/review/${id}`, { withCredentials: true })
        dispatch({
            type: DELETE_REVIEW_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_REVIEW_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
