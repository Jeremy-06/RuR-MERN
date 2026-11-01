import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

const EmptyState = ({ icon, title, message, action, flat }) => {
    return (
        <Paper sx={{ px: 3, py: 6, textAlign: 'center', ...(flat && { border: 0, boxShadow: 'none', bgcolor: 'transparent' }) }}>
            {icon && <Box aria-hidden="true" sx={{ color: 'text.secondary', mb: 1, lineHeight: 0, '& svg': { fontSize: 48 } }}>{icon}</Box>}
            <Typography variant="h5" component="h2">{title}</Typography>
            {message && <Typography color="textSecondary" sx={{ mt: 1 }}>{message}</Typography>}
            {action && <Box sx={{ mt: 3 }}>{action}</Box>}
        </Paper>
    )
}

export default EmptyState
