import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { clipCorners } from '../../theme'
import { DEFAULT_SORT, SORT_OPTIONS } from '../Utils/shopFilters'

export const FilterChips = ({ chips }) => (
    <>
        {chips.map(chip => (
            <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                color="primary"
                variant="outlined"
                aria-label={`Remove filter ${chip.label}`}
                onClick={chip.remove}
                onDelete={chip.remove}
            />
        ))}
    </>
)

const ShopToolbar = ({ shown, total, chips, sort, onSortChange, onClear, showClear, isMobile, activeCount, onOpenFilters }) => {
    return (
        <Paper sx={{ p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ mr: 'auto', fontWeight: 500 }} aria-live="polite">
                    {total !== undefined ? <>Showing <strong>{shown}</strong> of <strong>{total}</strong></> : 'Loading products'}
                </Typography>
                {isMobile && (
                    <Button variant="outlined" onClick={onOpenFilters} startIcon={<TuneOutlinedIcon />}>
                        Filters
                        {activeCount > 0 && (
                            <Box component="span" sx={{ ml: 1, minWidth: 20, px: 0.5, bgcolor: 'primary.main', color: '#fff', clipPath: clipCorners(4) }}>{activeCount}</Box>
                        )}
                    </Button>
                )}
                <TextField
                    select
                    size="small"
                    margin="none"
                    label="Sort by"
                    value={sort || DEFAULT_SORT}
                    onChange={(e) => onSortChange(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 200 } }}
                    slotProps={{ select: { id: 'sort_select' }, inputLabel: { shrink: true } }}
                >
                    {SORT_OPTIONS.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
            </Box>

            {chips.length > 0 && (
                <Box role="group" aria-label="Active filters" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                    <FilterChips chips={chips} />
                    {showClear && <Button size="small" onClick={onClear} sx={{ color: 'primary.dark' }}>Clear all</Button>}
                </Box>
            )}
        </Paper>
    )
}

export default ShopToolbar
