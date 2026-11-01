import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { clipCorners, darkTexture } from '../../theme'

const EmptyState = ({ icon, title, message, action, flat }) => {
    return (
        <Paper sx={{ px: 3, py: 6, textAlign: 'center', ...(flat && { border: 0, boxShadow: 'none', bgcolor: 'transparent' }) }}>
            {icon && (
                <Box
                    aria-hidden="true"
                    sx={{
                        display: 'inline-flex',
                        p: 1.75,
                        mb: 2,
                        color: '#fff',
                        bgcolor: 'rur.panel',
                        backgroundImage: darkTexture,
                        clipPath: clipCorners(10),
                        '& svg': { fontSize: 36 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant="h5" component="h2">{title}</Typography>
            {message && <Typography color="textSecondary" sx={{ mt: 1 }}>{message}</Typography>}
            {action && <Box sx={{ mt: 3 }}>{action}</Box>}
        </Paper>
    )
}

export default EmptyState
