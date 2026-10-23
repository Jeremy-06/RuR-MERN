import axios from 'axios';
import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

export const RES_PER_PAGE = 12

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

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
