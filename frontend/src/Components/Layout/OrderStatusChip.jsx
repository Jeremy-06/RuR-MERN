import Chip from '@mui/material/Chip'

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
