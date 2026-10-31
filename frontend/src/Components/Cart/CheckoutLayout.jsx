import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import OrderSummary from './OrderSummary'

// Page content on the left and the sticky summary on the right; on smaller screens the summary comes first
const CheckoutLayout = ({ children, hideItems, action }) => {
    const { cartItems } = useSelector(state => state.cart)

    if (cartItems.length === 0) return children

    return (
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 5 }} sx={{ order: { md: 2 }, position: { md: 'sticky' }, top: { md: 96 } }}>
                <OrderSummary hideItems={hideItems} action={action} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }} sx={{ order: { md: 1 } }}>
                {children}
                {action && <Box sx={{ display: { md: 'none' }, mt: 3 }}>{action}</Box>}
            </Grid>
        </Grid>
    )
}

export default CheckoutLayout
