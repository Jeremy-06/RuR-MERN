import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import MetaData from '../Layout/MetaData'
import { clearCart } from '../../actions/cartActions'
import { accentTop } from '../../theme'

const OrderSuccess = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(clearCart())
        sessionStorage.removeItem('orderInfo')
    }, [dispatch])

    return (
        <>
            <MetaData title={'Order Success'} />

            <Card sx={{ ...accentTop, height: 'auto', maxWidth: 640, mx: 'auto', mt: { xs: 3, md: 6 }, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                <Box
                    component="img"
                    src="/images/order_success.png"
                    alt=""
                    sx={{ display: 'block', width: 140, height: 140, objectFit: 'contain', mx: 'auto', mb: 3 }}
                />
                <Typography variant="h3" component="h1">Your Order has been placed successfully.</Typography>
                <Button component={Link} to="/orders/me" variant="contained" size="large" sx={{ mt: 3 }}>Go to Orders</Button>
            </Card>
        </>
    )
}

export default OrderSuccess
