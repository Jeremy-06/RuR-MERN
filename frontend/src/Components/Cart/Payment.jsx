import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import CheckoutSteps from './CheckoutSteps'
import { createOrder, clearErrors } from '../../actions/orderActions'
import { CREATE_ORDER_RESET } from '../../constants/orderConstants'
import { errMsg, formatMoney, successMsg } from '../Utils/helpers'
import { accentTop } from '../../theme'

// Demo checkout: every payment succeeds
const paymentResult = () => ({
    id: `pi_${Date.now()}`,
    status: 'succeeded'
})

const Payment = () => {
    const dispatch = useDispatch()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { loading, error, success } = useSelector(state => state.newOrder)
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

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (success) {
            successMsg('order created')
            sessionStorage.removeItem('orderInfo')
            dispatch({ type: CREATE_ORDER_RESET })
            navigate('/success')
        }
    }, [dispatch, error, success, navigate])

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(createOrder({
            ...order,
            paymentInfo: paymentResult()
        }))
    }

    return (
        <>
            <MetaData title={'Payment'} />
            <CheckoutSteps shipping confirmOrder payment />
            <PageHeader title="Card Info" subtitle="This is a demo checkout. Card details are not sent or stored." />

            <Card sx={{ ...accentTop, height: 'auto', maxWidth: 720, p: { xs: 2.5, sm: 4 } }}>
                <Box component="form" onSubmit={submitHandler}>
                    <TextField id="card_num_field" label="Card Number" autoComplete="off" slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ mt: 0 }} />
                    <Grid container columnSpacing={2}>
                        <Grid size={6}>
                            <TextField id="card_exp_field" label="Card Expiry" autoComplete="off" />
                        </Grid>
                        <Grid size={6}>
                            <TextField id="card_cvc_field" label="Card CVC" autoComplete="off" slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<LockOutlinedIcon />}
                        disabled={loading || !orderInfo || cartItems.length === 0}
                        sx={{ mt: 3 }}
                    >
                        {orderInfo ? `Pay ${formatMoney(orderInfo.totalPrice)}` : 'Pay'}
                    </Button>
                </Box>
            </Card>
        </>
    )
}

export default Payment
