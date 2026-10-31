import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Loader = () => {
    return (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress aria-label="Loading" />
        </Box>
    )
}

export default Loader
