import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import SectionTitle from '../Layout/SectionTitle'
import { accentTop } from '../../theme'

const AuthCard = ({ title, subtitle, onSubmit, children }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: { xs: 3, md: 6 } }}>
            <Card component="form" noValidate onSubmit={onSubmit} sx={{ ...accentTop, height: 'auto', width: '100%', maxWidth: 520, p: { xs: 3, md: 5 } }}>
                <SectionTitle variant="h3" component="h1" sx={{ mb: subtitle ? 1.5 : 2 }}>{title}</SectionTitle>
                {subtitle && <Typography color="textSecondary" sx={{ mb: 1 }}>{subtitle}</Typography>}
                {children}
            </Card>
        </Box>
    )
}

export default AuthCard
