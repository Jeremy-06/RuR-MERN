import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants'

// page = last page loaded for the current filter key
export const productsReducer = (state = { products: [], page: 0, hasMore: true, key: null }, action) => {
    switch (action.type) {
        case ALL_PRODUCTS_REQUEST: {
            // A new filter key (or page 1) starts a fresh list
            const reset = action.page === 1 || action.key !== state.key
            return {
                ...state,
                loading: true,
                error: null,
                key: action.key,
                requestedPage: action.page,
                products: reset ? [] : state.products,
                page: reset ? 0 : state.page,
                hasMore: reset ? true : state.hasMore,
                filteredProductsCount: reset ? undefined : state.filteredProductsCount,
            }
        }
        case ALL_PRODUCTS_SUCCESS: {
            // Ignore answers for filters that are no longer active
            if (action.key !== state.key) return state

            const loadedIds = new Set(state.products.map(product => product._id))
            const newProducts = action.payload.products.filter(product => !loadedIds.has(product._id))
            return {
                ...state,
                loading: false,
                products: [...state.products, ...newProducts],
                page: action.payload.currentPage,
                hasMore: action.payload.hasMore,
                productsCount: action.payload.productsCount,
                resPerPage: action.payload.resPerPage,
                filteredProductsCount: action.payload.filteredProductsCount
            }
        }
        case ALL_PRODUCTS_FAIL:
            if (action.key !== state.key) return state
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state;
    }
}

export const productDetailsReducer = (state = { product: {} }, action) => {
    switch (action.type) {
        case PRODUCT_DETAILS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            }
        case PRODUCT_DETAILS_SUCCESS:
            return {
                ...state,
                loading: false,
                product: action.payload
            }
        case PRODUCT_DETAILS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}
