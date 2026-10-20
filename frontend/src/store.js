import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    productDetailsReducer,
} from './reducers/productReducers'
import {
    authReducer,
} from './reducers/userReducers'

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
    auth: authReducer,
})

const middlware = [thunk]
const store = createStore(reducer, initialState, applyMiddleware(...middlware))
export default store;
