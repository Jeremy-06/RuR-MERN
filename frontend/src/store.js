import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    productDetailsReducer,
    searchSuggestionsReducer,
    topRatedProductsReducer,
} from './reducers/productReducers'
import {
    authReducer,
} from './reducers/userReducers'
import { cartReducer } from './reducers/cartReducers'
import {
    newOrderReducer,
    myOrdersReducer,
    orderDetailsReducer,
    allOrdersReducer,
    orderReducer,
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
    auth: authReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    orderDetails: orderDetailsReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
})

const middlware = [thunk]
// Uses the Redux DevTools extension when the browser has it
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(...middlware)))
export default store;
