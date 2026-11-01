import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { darkTexture } from '../../theme'

const StatCard = ({ label, value, to, dark }) => {
    return (
        <Paper
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: { xs: 2, sm: 2.5 },
                ...(dark && { bgcolor: 'rur.panel', backgroundImage: darkTexture, border: 0, color: '#fff' }),
            }}
        >
            <Typography variant="overline" component="p" sx={{ color: dark ? 'rur.muted' : 'text.secondary' }}>{label}</Typography>
            <Typography variant={dark ? 'h1' : 'h2'} component="p" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
            {to && (
                <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Button component={Link} to={to} size="small" sx={{ ml: -0.75, color: 'primary.dark' }}>View Details</Button>
                </Box>
            )}
        </Paper>
    )
}

export default StatCard
