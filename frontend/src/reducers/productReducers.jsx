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
    NEW_PRODUCT_RESET,
    NEW_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_RESET,
    UPDATE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_RESET,
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
    DELETE_REVIEW_RESET,
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

const noSuggestions = { products: [], categories: [], keyword: '' }

// keyword = text the list belongs to; answers for any other text are ignored
export const searchSuggestionsReducer = (state = noSuggestions, action) => {
    switch (action.type) {
        case SEARCH_SUGGESTIONS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                keyword: action.keyword
            }
        case SEARCH_SUGGESTIONS_SUCCESS:
            if (action.keyword !== state.keyword) return state
            return {
                ...state,
                loading: false,
                products: action.payload.products,
                categories: action.payload.categories
            }
        case SEARCH_SUGGESTIONS_FAIL:
            if (action.keyword !== state.keyword) return state
            return {
                ...state,
                loading: false,
                products: [],
                categories: [],
                error: action.payload
            }
        case SEARCH_SUGGESTIONS_CLEAR:
            return noSuggestions
        default:
            return state
    }
}

export const topRatedProductsReducer = (state = { products: [] }, action) => {
    switch (action.type) {
        case TOP_RATED_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case TOP_RATED_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: action.payload
            }
        case TOP_RATED_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        default:
            return state
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

export const newProductReducer = (state = { product: {} }, action) => {
    switch (action.type) {
        case NEW_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true
            }
        case NEW_PRODUCT_SUCCESS:
            return {
                loading: false,
                success: action.payload.success,
                product: action.payload.product
            }
        case NEW_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case NEW_PRODUCT_RESET:
            return {
                ...state,
                success: false
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

// deletedIds and message come from a single delete or a bulk delete
export const productReducer = (state = { deletedIds: [] }, action) => {
    switch (action.type) {
        case DELETE_PRODUCT_REQUEST:
        case UPDATE_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true
            }
        case DELETE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: true,
                deletedIds: action.payload.ids,
                message: action.payload.message
            }
        case UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: action.payload
            }
        case DELETE_PRODUCT_FAIL:
        case UPDATE_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case DELETE_PRODUCT_RESET:
            return {
                ...state,
                isDeleted: false,
                deletedIds: [],
                message: null
            }
        case UPDATE_PRODUCT_RESET:
            return {
                ...state,
                isUpdated: false
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

export const categoriesReducer = (state = { categories: null }, action) => {
    switch (action.type) {
        case ALL_CATEGORIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ALL_CATEGORIES_SUCCESS:
            return {
                loading: false,
                categories: action.payload
            }
        case ALL_CATEGORIES_FAIL:
            return {
                loading: false,
                categories: null,
                error: action.payload
            }
        default:
            return state
    }
}

// productId = product the list belongs to; a refresh of the same product keeps its rows
export const productReviewsReducer = (state = { reviews: [], productId: null }, action) => {
    switch (action.type) {
        case GET_REVIEWS_REQUEST:
            return {
                loading: true,
                productId: action.productId,
                reviews: action.productId === state.productId ? state.reviews : []
            }
        case GET_REVIEWS_SUCCESS:
            if (action.productId !== state.productId) return state
            return {
                ...state,
                loading: false,
                reviews: action.payload
            }
        case GET_REVIEWS_FAIL:
            if (action.productId !== state.productId) return state
            return {
                ...state,
                loading: false,
                reviews: [],
                error: action.payload
            }
        default:
            return state
    }
}

const noReview = { canReview: false, review: null }

export const myReviewReducer = (state = { ...noReview, productId: null }, action) => {
    switch (action.type) {
        case MY_REVIEW_REQUEST:
            return {
                ...noReview,
                productId: action.productId
            }
        case MY_REVIEW_SUCCESS:
            if (action.productId !== state.productId) return state
            return {
                productId: action.productId,
                canReview: action.payload.canReview,
                review: action.payload.review
            }
        case MY_REVIEW_FAIL:
            if (action.productId !== state.productId) return state
            return {
                ...noReview,
                productId: action.productId
            }
        default:
            return state
    }
}

export const newReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case NEW_REVIEW_REQUEST:
            return {
                ...state,
                loading: true
            }
        case NEW_REVIEW_SUCCESS:
            return {
                loading: false
            }
        case NEW_REVIEW_FAIL:
            return {
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

export const reviewReducer = (state = {}, action) => {
    switch (action.type) {
        case DELETE_REVIEW_REQUEST:
            return {
                ...state,
                loading: true
            }
        case DELETE_REVIEW_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }
        case DELETE_REVIEW_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case DELETE_REVIEW_RESET:
            return {
                ...state,
                isDeleted: false
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

export const adminProductsReducer = (state = { loading: true, products: [] }, action) => {
    switch (action.type) {
        case ADMIN_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            }
        case ADMIN_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: action.payload
            }
        case ADMIN_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        default:
            return state
    }
}
