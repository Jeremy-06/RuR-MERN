import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { PAGE_MIN_HEIGHT } from '../../theme'

const Loader = ({ label = 'Loading', fullPage = false, sx }) => {
    return (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 10, ...(fullPage && { alignItems: 'center', minHeight: PAGE_MIN_HEIGHT }), ...sx }}>
            <CircularProgress aria-label={label} />
        </Box>
    )
}

export default Loader
