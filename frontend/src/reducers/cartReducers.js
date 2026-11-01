import { ADD_TO_CART, REMOVE_ITEM_CART, SAVE_SHIPPING_INFO, CLEAR_CART, SET_CART_OWNER } from '../constants/cartConstants'

// undefined ang owner hanggang matapos ang login check
export const cartReducer = (state = { cartItems: [], shippingInfo: {} }, action) => {
    switch (action.type) {
        case SET_CART_OWNER:
            return {
                ...state,
                ...action.payload
            }
        case ADD_TO_CART: {
            const item = action.payload

            const isItemExist = state.cartItems.find(i => i.product === item.product)
            return {
                ...state,
                cartItems: isItemExist
                    ? state.cartItems.map(i => i.product === isItemExist.product ? item : i)
                    : [...state.cartItems, item]
            }
        }
        case REMOVE_ITEM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter(i => i.product !== action.payload)
            }
        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: action.payload
            }
        // Naiiwan ang shipping info para sa next order
        case CLEAR_CART:
            return {
                ...state,
                cartItems: []
            }
        default:
            return state
    }
}
