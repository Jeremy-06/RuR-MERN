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

            <Card
                sx={{
                    ...accentTop,
                    height: 'auto',
                    mt: { xs: 3, md: 6 },
                    p: { xs: 3, sm: 5, md: 7 },
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 3, md: 6 },
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                <Box
                    component="img"
                    src="/images/order_success.png"
                    alt=""
                    sx={{ width: { xs: 140, md: 180 }, height: { xs: 140, md: 180 }, flexShrink: 0, objectFit: 'contain' }}
                />
                <Box>
                    <Typography variant="h2" component="h1">Your Order has been placed successfully.</Typography>
                    <Button component={Link} to="/orders/me" variant="contained" size="large" sx={{ mt: 3 }}>Go to Orders</Button>
                </Box>
            </Card>
        </>
    )
}

export default OrderSuccess
