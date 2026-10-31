import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { accentGradient } from '../../theme'

// Uppercase heading with the slanted blue-to-red bar
const SectionTitle = ({ children, variant = 'h4', component = 'h2', id, sx }) => {
    return (
        <Box sx={sx}>
            <Typography variant={variant} component={component} id={id}>{children}</Typography>
            <Box aria-hidden="true" sx={{ width: 72, height: 5, mt: 1, background: accentGradient, transform: 'skewX(-30deg)', transformOrigin: 'left' }} />
        </Box>
    )
}

export default SectionTitle
