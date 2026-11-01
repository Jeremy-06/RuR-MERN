import axios from 'axios'
import { toast } from 'react-toastify';
import { ADD_TO_CART, REMOVE_ITEM_CART, SAVE_SHIPPING_INFO, CLEAR_CART, SET_CART_OWNER } from '../constants/cartConstants'

const readStorage = (key, fallback) => {
    try {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : fallback
    } catch {
        return fallback
    }
}

// Bawat account may sariling cart key
const saveCartItems = ({ owner, cartItems }) => {
    if (!owner) return
    localStorage.setItem(`cartItems_${owner}`, JSON.stringify(cartItems))
}

export const setCartOwner = (owner) => async (dispatch, getState) => {
    const { cart } = getState()
    if (cart.owner === owner) return

    const merged = readStorage(`cartItems_${owner}`, [])
    const incoming = [
        // Nililipat sa account cart ang items bago mag-login
        ...(owner !== 'guest' ? readStorage('cartItems_guest', []) : []),
        // Items na na-add bago makilala ang owner
        ...(cart.owner ? [] : cart.cartItems),
    ]
    incoming.forEach(item => {
        if (!merged.find(i => i.product === item.product)) merged.push(item)
    })

    dispatch({
        type: SET_CART_OWNER,
        payload: {
            owner,
            cartItems: merged,
            shippingInfo: readStorage(`shippingInfo_${owner}`, {})
        }
    })
    saveCartItems(getState().cart)

    // Nasa account cart na ang guest items
    if (owner !== 'guest') localStorage.removeItem('cartItems_guest')

    // Mga lumang keys na hindi na gamit
    localStorage.removeItem('cartItems')
    localStorage.removeItem('shippingInfo')
    localStorage.removeItem('rur_theme_variant')
}

export const addItemToCart = (id, quantity) => async (dispatch, getState) => {
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
        dispatch({
            type: ADD_TO_CART,
            payload: {
                product: data.product._id,
                name: data.product.name,
                price: data.product.price,
                image: data.product.images[0] ? data.product.images[0].url : '',
                stock: data.product.stock,
                quantity
            }
        })
        saveCartItems(getState().cart)

        toast.success('Item Added to Cart', {
            position: 'bottom-right'
        })
    } catch (error) {
        toast.error(error.response ? error.response.data.message : error.message, {
            position: 'top-left'
        });
    }
}

export const removeItemFromCart = (id) => async (dispatch, getState) => {
    dispatch({
        type: REMOVE_ITEM_CART,
        payload: id
    })
    saveCartItems(getState().cart)
}

export const saveShippingInfo = (data) => async (dispatch, getState) => {
    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data
    })
    localStorage.setItem(`shippingInfo_${getState().cart.owner}`, JSON.stringify(data))
}

export const clearCart = () => async (dispatch, getState) => {
    dispatch({
        type: CLEAR_CART,
    })
    saveCartItems(getState().cart)
}
