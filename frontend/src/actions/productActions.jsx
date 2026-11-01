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
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_SUCCESS,
    NEW_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAIL,
    ALL_CATEGORIES_REQUEST,
    ALL_CATEGORIES_SUCCESS,
    ALL_CATEGORIES_FAIL,
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
    PRODUCT_FACETS_REQUEST,
    PRODUCT_FACETS_SUCCESS,
    PRODUCT_FACETS_FAIL,
    RELATED_PRODUCTS_REQUEST,
    RELATED_PRODUCTS_SUCCESS,
    RELATED_PRODUCTS_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

const RES_PER_PAGE = 12
const TOP_RATED_COUNT = 4
const RELATED_COUNT = 4

// Parehong filters, parehong key, para ma-spot ang lumang answers
export const productsKey = ({ keyword = '', minPrice = '', maxPrice = '', categories = [], minRating = '', minReviews = '', sort = '' }) =>
    JSON.stringify([keyword, minPrice, maxPrice, [...categories].sort(), minRating, minReviews, sort])

// Parehong params ang /products at /products/facets
const shopParams = (filters) => {
    const params = new URLSearchParams()
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.minPrice !== '') params.set('minPrice', filters.minPrice)
    if (filters.maxPrice !== '') params.set('maxPrice', filters.maxPrice)
    filters.categories.forEach(category => params.append('category', category))
    if (filters.minRating) params.set('minRating', filters.minRating)
    if (filters.minReviews) params.set('minReviews', filters.minReviews)
    return params
}

export const getProducts = (filters, currentPage = 1) => async (dispatch, getState) => {
    const key = productsKey(filters)
    const { products: state } = getState()

    // Isang request lang kada page, at next page lang
    if (state.loading && state.key === key && state.requestedPage === currentPage) return
    if (currentPage > 1 && (state.loading || state.key !== key || !state.hasMore || currentPage !== state.page + 1)) return

    try {
        dispatch({
            type: ALL_PRODUCTS_REQUEST,
            key,
            page: currentPage
        })

        const params = shopParams(filters)
        params.set('page', currentPage)
        params.set('limit', RES_PER_PAGE)
        if (filters.sort) params.set('sort', filters.sort)

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

export const getProductFacets = (filters) => async (dispatch) => {
    const key = productsKey(filters)
    try {
        dispatch({ type: PRODUCT_FACETS_REQUEST, key })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/products/facets?${shopParams(filters).toString()}`)
        dispatch({
            type: PRODUCT_FACETS_SUCCESS,
            key,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_FACETS_FAIL,
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

const productFormConfig = {
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
}

export const newProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PRODUCT_REQUEST })
        const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, productData, productFormConfig)
        dispatch({
            type: NEW_PRODUCT_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_PRODUCT_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PRODUCT_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}`, productData, productFormConfig)
        dispatch({
            type: UPDATE_PRODUCT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_PRODUCT_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const deleteProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_PRODUCT_REQUEST })
        await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, { withCredentials: true })
        dispatch({
            type: DELETE_PRODUCT_SUCCESS,
            payload: { ids: [id], message: 'Product deleted successfully' }
        })
    } catch (error) {
        dispatch({
            type: DELETE_PRODUCT_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const deleteProducts = (ids) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_PRODUCT_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/products`, { data: { ids }, withCredentials: true })
        dispatch({
            type: DELETE_PRODUCT_SUCCESS,
            payload: { ids, message: data.message }
        })
    } catch (error) {
        dispatch({
            type: DELETE_PRODUCT_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const getCategories = () => async (dispatch, getState) => {
    // Sabay kumukuha ang Home at Footer
    if (getState().categories.loading) return

    try {
        dispatch({ type: ALL_CATEGORIES_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/categories`)
        dispatch({
            type: ALL_CATEGORIES_SUCCESS,
            payload: data.categories
        })
    } catch (error) {
        dispatch({
            type: ALL_CATEGORIES_FAIL,
            payload: error.response ? error.response.data.message : 'Could not load categories'
        })
    }
}

// Kasama ang keyword para ma-drop ng reducer ang late answers
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

export const getTopRatedProducts = () => async (dispatch) => {
    try {
        dispatch({ type: TOP_RATED_PRODUCTS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/products`, { params: { minRating: 4, sort: 'top_rated', limit: TOP_RATED_COUNT } })
        dispatch({
            type: TOP_RATED_PRODUCTS_SUCCESS,
            payload: data.products
        })
    } catch (error) {
        dispatch({
            type: TOP_RATED_PRODUCTS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// Isa pa sa limit kasi kasama ang product mismo sa sagot
export const getRelatedProducts = (id, category) => async (dispatch) => {
    try {
        dispatch({ type: RELATED_PRODUCTS_REQUEST, productId: id })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/products`, { params: { category, limit: RELATED_COUNT + 1 } })
        dispatch({
            type: RELATED_PRODUCTS_SUCCESS,
            productId: id,
            payload: data.products.filter(product => product._id !== id).slice(0, RELATED_COUNT)
        })
    } catch (error) {
        dispatch({
            type: RELATED_PRODUCTS_FAIL,
            productId: id,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// Kasama ang product id para ma-drop ng reducer ang late answers
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

// POST pag bago, PUT pag edit; binabalik ang response kung na-save
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
        return data
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
