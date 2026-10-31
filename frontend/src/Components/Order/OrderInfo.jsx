import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import OrderStatusChip from '../Layout/OrderStatusChip'
import { formatDateTime, formatMoney } from '../Utils/helpers'

const Section = ({ title, children }) => (
    <Card sx={{ height: 'auto', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>{title}</Typography>
        {children}
    </Card>
)

const Detail = ({ label, children }) => (
    <Typography variant="body2" sx={{ mb: 0.75, overflowWrap: 'anywhere' }}>
        <Box component="span" sx={{ fontWeight: 700 }}>{label}:</Box> {children}
    </Typography>
)

// Order sections shared by the customer's order page and the admin's process order page
const OrderInfo = ({ order, showPaymentId }) => {
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus, createdAt, deliveredAt } = order
    const shippingDetails = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    const isPaid = paymentInfo && paymentInfo.status === 'succeeded'

    return (
        <Stack sx={{ gap: 2 }}>
            <Section title="Shipping Info">
                <Detail label="Name">{user ? user.name : 'Deleted user'}</Detail>
                <Detail label="Phone">{shippingInfo.phoneNo}</Detail>
                <Detail label="Address">{shippingDetails}</Detail>
                <Detail label="Amount">{formatMoney(totalPrice)}</Detail>
            </Section>

            <Section title="Payment">
                <Chip
                    label={isPaid ? 'PAID' : 'NOT PAID'}
                    size="small"
                    color={isPaid ? undefined : 'error'}
                    sx={theme => isPaid ? theme.palette.rur.orderStatus.Delivered : {}}
                />
                {showPaymentId && paymentInfo && (
                    <Typography variant="body2" sx={{ mt: 1.5, overflowWrap: 'anywhere' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>Payment ID:</Box> {paymentInfo.id}
                    </Typography>
                )}
            </Section>

            <Section title="Order Status">
                <OrderStatusChip status={orderStatus} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>Placed {formatDateTime(createdAt)}</Typography>
                {deliveredAt && <Typography variant="body2" color="textSecondary">Delivered {formatDateTime(deliveredAt)}</Typography>}
            </Section>

            <Section title="Order Items">
                <Stack divider={<Divider />} sx={{ gap: 1.5 }}>
                    {orderItems.map(item => (
                        <Stack key={item.product} direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                            <Box
                                component="img"
                                src={item.image}
                                alt=""
                                sx={{ width: 64, height: 64, flexShrink: 0, objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                            />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Link component={RouterLink} to={`/product/${item.product}`} variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Link>
                                <Typography variant="body2" color="textSecondary">{item.quantity} × {formatMoney(item.price)}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>{formatMoney(item.price * item.quantity)}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Section>
        </Stack>
    )
}

export default OrderInfo
