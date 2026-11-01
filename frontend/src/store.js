import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    productDetailsReducer,
    searchSuggestionsReducer,
    topRatedProductsReducer,
    productReviewsReducer,
    myReviewReducer,
    newReviewReducer,
    reviewReducer,
    adminProductsReducer,
    newProductReducer,
    productReducer,
    categoriesReducer,
    productFacetsReducer,
    relatedProductsReducer,
} from './reducers/productReducers'
import {
    authReducer,
    userReducer,
    forgotPasswordReducer,
    allUsersReducer,
    userDetailsReducer,
} from './reducers/userReducers'
import { cartReducer } from './reducers/cartReducers'
import {
    newOrderReducer,
    myOrdersReducer,
    orderDetailsReducer,
    allOrdersReducer,
    orderReducer,
    dashboardSalesReducer,
    salesReportReducer,
} from './reducers/orderReducers'

let initialState = {
    auth: {
        loading: true,
        isAuthenticated: false,
        user: null
    },
}

const reducer = combineReducers({
    products: productsReducer,
    productDetails: productDetailsReducer,
    searchSuggestions: searchSuggestionsReducer,
    topRatedProducts: topRatedProductsReducer,
    productReviews: productReviewsReducer,
    myReview: myReviewReducer,
    newReview: newReviewReducer,
    review: reviewReducer,
    adminProducts: adminProductsReducer,
    newProduct: newProductReducer,
    product: productReducer,
    categories: categoriesReducer,
    productFacets: productFacetsReducer,
    relatedProducts: relatedProductsReducer,
    auth: authReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    allUsers: allUsersReducer,
    userDetails: userDetailsReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    orderDetails: orderDetailsReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    dashboardSales: dashboardSalesReducer,
    salesReport: salesReportReducer,
})

const middlware = [thunk]
// DevTools extension kung meron sa browser
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(...middlware)))
export default store;
