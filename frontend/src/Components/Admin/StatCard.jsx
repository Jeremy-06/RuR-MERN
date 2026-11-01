import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { clipCorners, darkTexture } from '../../theme'

const StatCard = ({ label, value, icon, trend, to, dark }) => {
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="overline" component="p" sx={{ color: dark ? 'rur.muted' : 'text.secondary' }}>{label}</Typography>
                {icon && (
                    <Box
                        aria-hidden="true"
                        sx={{ display: 'flex', p: 0.75, color: dark ? '#fff' : 'primary.dark', bgcolor: dark ? 'primary.dark' : '#e6f0ff', clipPath: clipCorners(6), '& svg': { fontSize: 20 } }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>
            <Typography variant={dark ? 'h1' : 'h2'} component="p" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
            {trend && (
                <Typography variant="body2" sx={{ mt: 0.5, color: dark ? '#c9d0da' : 'text.secondary' }}>{trend}</Typography>
            )}
            {to && (
                <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Button component={Link} to={to} size="small" sx={{ ml: -0.75, color: 'primary.dark' }}>View Details</Button>
                </Box>
            )}
        </Paper>
    )
}

export default StatCard
