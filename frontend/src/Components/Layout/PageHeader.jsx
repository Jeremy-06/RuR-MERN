import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SectionTitle from './SectionTitle'

const PageHeader = ({ title, subtitle, actions }) => {
    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', gap: 2, mt: { xs: 3, md: 4 }, mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                <SectionTitle variant="h2" component="h1">{title}</SectionTitle>
                {subtitle && <Typography color="textSecondary" sx={{ mt: 1 }}>{subtitle}</Typography>}
            </Box>
            {actions && <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>{actions}</Stack>}
        </Stack>
    )
}

export default PageHeader
