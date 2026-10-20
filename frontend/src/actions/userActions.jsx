import axios from 'axios'
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    CLEAR_ERRORS
} from '../constants/userConstants'

export const register = (userData) => async (dispatch) => {
    try {
        dispatch({ type: REGISTER_USER_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/register`, userData, config)

        dispatch({
            type: REGISTER_USER_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: REGISTER_USER_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }

        const { data } = await axios.post(`${import.meta.env.VITE_API}/login`, { email, password }, config)
        dispatch({
            type: LOGIN_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// Sends the Firebase ID token; the backend answers with the same cookie as normal login
export const googleLogin = (idToken) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }

        const { data } = await axios.post(`${import.meta.env.VITE_API}/login/google`, { idToken }, config)
        dispatch({
            type: LOGIN_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const loadUser = () => async (dispatch) => {
    try {
        dispatch({ type: LOAD_USER_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, { withCredentials: true })
        dispatch({
            type: LOAD_USER_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: LOAD_USER_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const logout = () => async (dispatch) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        }
        await axios.get(`${import.meta.env.VITE_API}/logout`, config)
        dispatch({
            type: LOGOUT_SUCCESS,
        })
    } catch (error) {
        dispatch({
            type: LOGOUT_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
