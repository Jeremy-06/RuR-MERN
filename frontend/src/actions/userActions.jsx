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
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    NEW_PASSWORD_REQUEST,
    NEW_PASSWORD_SUCCESS,
    NEW_PASSWORD_FAIL,
    ALL_USERS_REQUEST,
    ALL_USERS_SUCCESS,
    ALL_USERS_FAIL,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_FAIL,
    USER_DETAILS_REQUEST,
    USER_DETAILS_SUCCESS,
    USER_DETAILS_FAIL,
    DELETE_USER_REQUEST,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAIL,
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

const jsonConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
}

const errorMessage = (error) => error.response ? error.response.data.message : error.message

export const updateProfile = (userData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PROFILE_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
        dispatch({
            type: UPDATE_PROFILE_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_PROFILE_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const updatePassword = (passwords) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PASSWORD_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/password/update`, passwords, jsonConfig)
        dispatch({
            type: UPDATE_PASSWORD_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_PASSWORD_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const forgotPassword = (email) => async (dispatch) => {
    try {
        dispatch({ type: FORGOT_PASSWORD_REQUEST })
        const { data } = await axios.post(`${import.meta.env.VITE_API}/password/forgot`, { email }, jsonConfig)
        dispatch({
            type: FORGOT_PASSWORD_SUCCESS,
            payload: data.message
        })
    } catch (error) {
        dispatch({
            type: FORGOT_PASSWORD_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const resetPassword = (token, passwords) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PASSWORD_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/password/reset/${token}`, passwords, jsonConfig)
        dispatch({
            type: NEW_PASSWORD_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: NEW_PASSWORD_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const allUsers = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_USERS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, jsonConfig)
        dispatch({
            type: ALL_USERS_SUCCESS,
            payload: data.users
        })
    } catch (error) {
        dispatch({
            type: ALL_USERS_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const getUserDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: USER_DETAILS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${id}`, jsonConfig)
        dispatch({
            type: USER_DETAILS_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: USER_DETAILS_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const updateUser = (id, userData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_USER_REQUEST })
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}`, userData, jsonConfig)
        dispatch({
            type: UPDATE_USER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_USER_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const deleteUser = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_USER_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, jsonConfig)
        dispatch({
            type: DELETE_USER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_USER_FAIL,
            payload: errorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
