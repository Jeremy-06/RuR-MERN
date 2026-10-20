import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import axios from 'axios';
import { errMsg, successMsg } from '../Utils/helpers'

const Payment = ({ cartItems, shippingInfo }) => {
    const [loading, setLoading] = useState(false)
    let navigate = useNavigate();

    const order = {
        orderItems: cartItems,
        shippingInfo
    }

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));
    if (orderInfo) {
        order.itemsPrice = orderInfo.itemsPrice
        order.shippingPrice = orderInfo.shippingPrice
        order.taxPrice = orderInfo.taxPrice
        order.totalPrice = orderInfo.totalPrice
    }

    const createOrder = async (order) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }
            setLoading(true)
            await axios.post(`${import.meta.env.VITE_API}/order/new`, order, config)
            setLoading(false)
            successMsg('order created')
            sessionStorage.removeItem('orderInfo')
            navigate('/success')
        } catch (error) {
            setLoading(false)
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        createOrder({
            ...order,
            paymentInfo: {
                id: `pi_${Date.now()}`,
                status: 'succeeded'
            }
        })
    }

    return (
        <>
            <MetaData title={'Payment'} />
            <CheckoutSteps shipping confirmOrder payment />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-4">Card Info</h1>
                        <div className="form-group">
                            <label htmlFor="card_num_field">Card Number</label>
                            <input
                                type="text"
                                id="card_num_field"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="card_exp_field">Card Expiry</label>
                            <input
                                type="text"
                                id="card_exp_field"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="card_cvc_field">Card CVC</label>
                            <input
                                type="text"
                                id="card_cvc_field"
                                className="form-control"
                            />
                        </div>
                        <button
                            id="pay_btn"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading || !orderInfo}
                        >
                            Pay {` - $${orderInfo && orderInfo.totalPrice}`}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Payment
