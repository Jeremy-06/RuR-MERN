import Chip from '@mui/material/Chip'

// Colors for each status live in theme.js
const OrderStatusChip = ({ status }) => {
    return (
        <Chip
            label={status}
            size="small"
            sx={theme => theme.palette.rur.orderStatus[status] || {}}
        />
    )
}

export default OrderStatusChip
