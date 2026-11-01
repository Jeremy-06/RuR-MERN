import { useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { formatMoney, orderPrices } from '../Utils/helpers'
import { accentTop } from '../../theme'

const PriceRow = ({ label, value }) => (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography color="textSecondary">{label}</Typography>
        <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Stack>
)

// hideItems: para sa pages na naka-lista na ang items
const OrderSummary = ({ hideItems, action }) => {
    const { cartItems } = useSelector(state => state.cart)
    const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'))
    const { itemsPrice, shippingPrice, taxPrice, totalPrice } = orderPrices(cartItems)

    const items = !hideItems && (
        <>
            <Stack component="ul" divider={<Divider />} sx={{ flexShrink: 1, minHeight: 0, overflowY: 'auto', listStyle: 'none', m: 0, p: 0 }}>
                {cartItems.map(item => (
                    <Stack component="li" key={item.product} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.25 }}>
                        <Box
                            component="img"
                            src={item.image || '/images/default_avatar.svg'}
                            alt=""
                            sx={{ width: 56, height: 56, flexShrink: 0, objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{item.name}</Typography>
                            <Typography variant="body2" color="textSecondary">Qty {item.quantity}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>{formatMoney(item.price * item.quantity)}</Typography>
                    </Stack>
                ))}
            </Stack>
            <Divider sx={{ mb: 2 }} />
        </>
    )

    const prices = (
        <>
            <Stack spacing={1}>
                <PriceRow label="Subtotal" value={formatMoney(itemsPrice)} />
                <PriceRow label="Shipping" value={formatMoney(shippingPrice)} />
                <PriceRow label="Tax" value={formatMoney(taxPrice)} />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography color="textSecondary">Total</Typography>
                <Typography variant="h3" component="p">{formatMoney(totalPrice)}</Typography>
            </Stack>
        </>
    )

    if (isSmall) {
        const count = cartItems.length
        return (
            <Accordion disableGutters sx={{ '&::before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="order-summary-content" id="order-summary-header">
                    <Typography sx={{ fontWeight: 700 }}>
                        Order summary ({count} {count === 1 ? 'item' : 'items'}) — {formatMoney(totalPrice)}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {items}
                    {prices}
                </AccordionDetails>
            </Accordion>
        )
    }

    return (
        <Card
            component="section"
            aria-labelledby="order-summary-title"
            sx={{ ...accentTop, display: 'flex', flexDirection: 'column', height: 'auto', maxHeight: 'calc(100vh - 112px)', p: 3 }}
        >
            <Typography id="order-summary-title" variant="h4" component="h2" sx={{ mb: hideItems ? 2 : 1 }}>Order Summary</Typography>
            {items}
            {prices}
            {action && <Box sx={{ mt: 3 }}>{action}</Box>}
        </Card>
    )
}

export default OrderSummary
