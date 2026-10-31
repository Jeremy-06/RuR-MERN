import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import PageHeader from '../Layout/PageHeader'
import EmptyState from '../Layout/EmptyState'
import QuantitySelector from '../Layout/QuantitySelector'
import { formatMoney } from '../Utils/helpers'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'
import { accentTop } from '../../theme'

const Cart = () => {
    const dispatch = useDispatch()
    const { owner, cartItems } = useSelector(state => state.cart)
    const navigate = useNavigate()

    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart(id, newQty))
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping')
    }

    const units = cartItems.reduce((acc, item) => acc + Number(item.quantity), 0)
    const total = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)

    if (!owner) return <Loader />

    return (
        <>
            <MetaData title={'Your Cart'} />
            <PageHeader
                title="Your Cart"
                subtitle={cartItems.length > 0 ? `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}` : undefined}
            />

            {cartItems.length === 0 ? (
                <EmptyState
                    icon={<ShoppingCartOutlinedIcon />}
                    title="Your Cart is Empty"
                    message="Add some gear and it will show up here."
                    action={<Button component={RouterLink} to="/" variant="contained">Browse products</Button>}
                />
            ) : (
                <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                            {cartItems.map(item => (
                                <Card
                                    component="li"
                                    key={item.product}
                                    sx={{
                                        p: 2,
                                        height: 'auto',
                                        transition: 'border-color 180ms ease',
                                        '&:hover': { borderColor: 'primary.main' },
                                        display: 'grid',
                                        alignItems: 'center',
                                        columnGap: 2,
                                        rowGap: 1.5,
                                        gridTemplateColumns: { xs: '80px 1fr auto', sm: '96px 1fr auto auto auto' },
                                        gridTemplateAreas: {
                                            xs: '"image name remove" "image quantity total"',
                                            sm: '"image name quantity total remove"',
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.image || '/images/default_avatar.svg'}
                                        alt={item.name}
                                        sx={{ gridArea: 'image', width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                                    />

                                    <Box sx={{ gridArea: 'name', minWidth: 0 }}>
                                        <Link component={RouterLink} to={`/product/${item.product}`} sx={{ color: 'text.primary', fontWeight: 700, overflowWrap: 'anywhere' }}>
                                            {item.name}
                                        </Link>
                                        <Typography variant="body2" color="textSecondary">{formatMoney(item.price)} each</Typography>
                                    </Box>

                                    <Box sx={{ gridArea: 'quantity' }}>
                                        <QuantitySelector
                                            quantity={item.quantity}
                                            stock={item.stock}
                                            label={`quantity of ${item.name}`}
                                            onDecrease={() => decreaseQty(item.product, item.quantity)}
                                            onIncrease={() => increaseQty(item.product, item.quantity, item.stock)}
                                        />
                                    </Box>

                                    <Typography variant="h4" component="p" sx={{ gridArea: 'total', textAlign: 'right', minWidth: { sm: 104 } }}>
                                        {formatMoney(item.quantity * item.price)}
                                    </Typography>

                                    <IconButton
                                        aria-label={`Remove ${item.name}`}
                                        onClick={() => removeCartItemHandler(item.product)}
                                        sx={{ gridArea: 'remove', color: 'error.main' }}
                                    >
                                        <DeleteOutlinedIcon />
                                    </IconButton>
                                </Card>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
                        <Card component="section" aria-labelledby="order-summary-title" sx={{ ...accentTop, p: 3 }}>
                            <Typography id="order-summary-title" variant="h4" component="h2">Order Summary</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={1}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography color="textSecondary">Subtotal</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{units} {units === 1 ? 'unit' : 'units'}</Typography>
                                </Stack>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography color="textSecondary">Est. total</Typography>
                                    <Typography variant="h2" component="p">{formatMoney(total)}</Typography>
                                </Stack>
                            </Stack>
                            <Button variant="contained" size="large" fullWidth onClick={checkoutHandler} sx={{ mt: 3 }}>Check out</Button>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </>
    )
}

export default Cart
