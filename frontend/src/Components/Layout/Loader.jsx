import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Loader = ({ label = 'Loading', sx }) => {
    return (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 10, ...sx }}>
            <CircularProgress aria-label={label} />
        </Box>
    )
}

export default Loader
