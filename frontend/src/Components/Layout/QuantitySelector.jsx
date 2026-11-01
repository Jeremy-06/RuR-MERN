import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const QuantitySelector = ({ quantity, stock, onDecrease, onIncrease, label = 'quantity' }) => {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', border: 1, borderColor: 'rur.muted', borderRadius: 1 }}>
            <IconButton size="small" aria-label={`Decrease ${label}`} disabled={quantity <= 1} onClick={onDecrease}>
                <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography aria-live="polite" sx={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
            <IconButton size="small" aria-label={`Increase ${label}`} disabled={quantity >= stock} onClick={onIncrease}>
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    )
}

export default QuantitySelector
