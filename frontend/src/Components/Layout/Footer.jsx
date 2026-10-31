import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { accentGradient, darkTexture } from '../../theme'

const Footer = () => {
    return (
        <Box component="footer" sx={{ mt: 8, bgcolor: 'rur.black', backgroundImage: darkTexture, color: 'rur.muted' }}>
            <Box aria-hidden="true" sx={{ height: 2, background: accentGradient }} />
            <Container sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 3 }}>
                <span className="brand-mark footer-mark">R<span>u</span>R</span>
                <Typography variant="body2">RuR - Ready. Up. Repeat. &copy; 2026, All Rights Reserved</Typography>
            </Container>
        </Box>
    )
}

export default Footer
