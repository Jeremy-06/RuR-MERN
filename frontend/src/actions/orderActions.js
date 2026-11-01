import axios from 'axios'
import {
    CREATE_ORDER_REQUEST,
    CREATE_ORDER_SUCCESS,
    CREATE_ORDER_FAIL,
    MY_ORDERS_REQUEST,
    MY_ORDERS_SUCCESS,
    MY_ORDERS_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ALL_ORDERS_REQUEST,
    ALL_ORDERS_SUCCESS,
    ALL_ORDERS_FAIL,
    UPDATE_ORDER_REQUEST,
    UPDATE_ORDER_SUCCESS,
    UPDATE_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    DELETE_ORDER_FAIL,
    DASHBOARD_SALES_REQUEST,
    DASHBOARD_SALES_SUCCESS,
    DASHBOARD_SALES_FAIL,
    SALES_REPORT_REQUEST,
    SALES_REPORT_SUCCESS,
    SALES_REPORT_FAIL,
    CLEAR_ERRORS
} from '../constants/orderConstants'

const config = {
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
}

const errorMessage = (error) => error.response ? error.response.data.message : error.message

export const createOrder = (order) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_ORDER_REQUEST })
        const { data } = await axios.post(`${import.meta.env.VITE_API}/order/new`, order, config)
        dispatch({
            type: CREATE_ORDER_SUCCESS,
            payload: data.order
        })
    } catch (error) {
        dispatch({
            type: CREATE_ORDER_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const myOrders = () => async (dispatch) => {
    try {
        dispatch({ type: MY_ORDERS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config)
        dispatch({
            type: MY_ORDERS_SUCCESS,
            payload: data.orders
        })
    } catch (error) {
        dispatch({
            type: MY_ORDERS_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const getOrderDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config)
        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data.order
        })
    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const allOrders = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_ORDERS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
        dispatch({
            type: ALL_ORDERS_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ALL_ORDERS_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const updateOrder = (id, orderData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_ORDER_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/order/${id}`, orderData, config)
        dispatch({
            type: UPDATE_ORDER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_ORDER_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const deleteOrder = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_ORDER_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
        dispatch({
            type: DELETE_ORDER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_ORDER_FAIL,
            payload: errorMessage(error)
        })
    }
}

// The three charts on the dashboard
export const getDashboardSales = () => async (dispatch) => {
    try {
        dispatch({ type: DASHBOARD_SALES_REQUEST })
        const [monthly, customers, products] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config),
            axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, config),
            axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, config),
        ])
        dispatch({
            type: DASHBOARD_SALES_SUCCESS,
            payload: {
                monthly: monthly.data.salesPerMonth,
                customers: customers.data.customerSales,
                products: products.data.totalPercentage
            }
        })
    } catch (error) {
        dispatch({
            type: DASHBOARD_SALES_FAIL,
            payload: errorMessage(error)
        })
    }
}

// key names the filters so the reducer can drop late answers
export const getSalesReport = (key, params) => async (dispatch) => {
    try {
        dispatch({ type: SALES_REPORT_REQUEST, key })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-by-date`, { params, withCredentials: true })
        dispatch({
            type: SALES_REPORT_SUCCESS,
            key,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: SALES_REPORT_FAIL,
            key,
            payload: errorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
