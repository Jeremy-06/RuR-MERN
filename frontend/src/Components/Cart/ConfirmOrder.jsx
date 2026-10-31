import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import EmptyState from '../Layout/EmptyState'
import CheckoutLayout from './CheckoutLayout'
import CheckoutSteps from './CheckoutSteps'
import { formatMoney, orderPrices } from '../Utils/helpers'

const ConfirmOrder = () => {
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)
    let navigate = useNavigate();

    const processToPayment = () => {
        const { itemsPrice, shippingPrice, taxPrice, totalPrice } = orderPrices(cartItems)
        const data = {
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice: totalPrice.toFixed(2)
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    if (cartItems.length === 0) {
        return (
            <>
                <MetaData title={'Confirm Order'} />
                <CheckoutSteps shipping confirmOrder />
                <Box sx={{ mt: 3 }}>
                    <EmptyState
                        icon={<ShoppingCartOutlinedIcon />}
                        title="Your Cart is Empty"
                        message="Add some gear before checking out."
                        action={<Button component={RouterLink} to="/" variant="contained">Browse products</Button>}
                    />
                </Box>
            </>
        )
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps shipping confirmOrder />
            <PageHeader title="Confirm Order" subtitle="Check everything looks right before paying." />

            <CheckoutLayout
                hideItems
                action={<Button variant="contained" size="large" fullWidth onClick={processToPayment}>Proceed to Payment</Button>}
            >
                <Stack spacing={3}>
                    <Card component="section" aria-labelledby="shipping-info-title" sx={{ height: 'auto', p: 3 }}>
                        <Typography id="shipping-info-title" variant="h4" component="h2" sx={{ mb: 2 }}>Shipping Info</Typography>
                        {user && <Typography><b>Name:</b> {user.name}</Typography>}
                        <Typography sx={{ mt: 0.5 }}><b>Phone:</b> {shippingInfo.phoneNo}</Typography>
                        <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                            <b>Address:</b> {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}
                        </Typography>
                    </Card>

                    <Card component="section" aria-labelledby="cart-items-title" sx={{ height: 'auto', p: 3 }}>
                        <Typography id="cart-items-title" variant="h4" component="h2" sx={{ mb: 1 }}>Your Cart Items</Typography>
                        <Stack component="ul" divider={<Divider />} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                            {cartItems.map(item => (
                                <Box
                                    component="li"
                                    key={item.product}
                                    sx={{ py: 1.5, display: 'grid', alignItems: 'center', columnGap: 2, gridTemplateColumns: { xs: '56px 1fr', sm: '72px 1fr auto' } }}
                                >
                                    <Box
                                        component="img"
                                        src={item.image || '/images/default_avatar.svg'}
                                        alt={item.name}
                                        sx={{ gridRow: { xs: 'span 2', sm: 'auto' }, width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                                    />
                                    <Link component={RouterLink} to={`/product/${item.product}`} sx={{ color: 'text.primary', fontWeight: 700, overflowWrap: 'anywhere' }}>
                                        {item.name}
                                    </Link>
                                    <Typography color="textSecondary" sx={{ textAlign: { sm: 'right' } }}>
                                        {item.quantity} x {formatMoney(item.price)} = <Box component="b" sx={{ color: 'text.primary' }}>{formatMoney(item.quantity * item.price)}</Box>
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Stack>
            </CheckoutLayout>
        </>
    )
}

export default ConfirmOrder
