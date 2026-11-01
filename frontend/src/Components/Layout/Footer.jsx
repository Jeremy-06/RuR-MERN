import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { accentGradient, darkTexture } from '../../theme'
import { getCategories } from '../../actions/productActions'

const FOOTER_CATEGORIES = 6

// Body ang nag-i-scroll dito, kaya walang epekto ang window.scrollTo
const scrollToTop = () => document.getElementById('root').scrollIntoView()

const FooterColumn = ({ title, links }) => (
    <Box component="nav" aria-label={title}>
        <Typography variant="h6" component="h2" sx={{ color: '#fff', mb: 1 }}>{title}</Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.75 }}>
            {links.map(link => (
                <li key={link.to}>
                    <Link
                        component={RouterLink}
                        to={link.to}
                        variant="body2"
                        onClick={scrollToTop}
                        sx={{ color: '#c9d0da', '&:hover': { color: '#fff' }, '&:focus-visible': { outlineColor: '#fff' } }}
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </Box>
    </Box>
)

const Footer = () => {
    const dispatch = useDispatch()
    const { categories } = useSelector(state => state.categories)
    const { user } = useSelector(state => state.auth)

    useEffect(() => {
        if (!categories) dispatch(getCategories())
    }, [dispatch, categories])

    const shopLinks = [
        { to: '/', label: 'All gear' },
        ...(categories || []).slice(0, FOOTER_CATEGORIES).map(category => ({ to: `/?category=${encodeURIComponent(category)}`, label: category })),
    ]
    const accountLinks = user
        ? [{ to: '/me', label: 'Profile' }, { to: '/orders/me', label: 'My orders' }, { to: '/cart', label: 'Cart' }]
        : [{ to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }, { to: '/cart', label: 'Cart' }]
    const helpLinks = user
        ? [{ to: '/password/update', label: 'Change password' }]
        : [{ to: '/password/forgot', label: 'Forgot password' }]

    return (
        <Box component="footer" sx={{ mt: 8, bgcolor: 'rur.black', backgroundImage: darkTexture, color: 'rur.muted' }}>
            <Box aria-hidden="true" sx={{ height: 2, background: accentGradient }} />
            <Container sx={{ py: { xs: 4, md: 6 } }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <span className="brand-mark">R<span>u</span>R</span>
                        <Typography sx={{ mt: 1.5, color: '#c9d0da', maxWidth: 280 }}>Ready. Up. Repeat. Gear for every late night and every new high score.</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                        <FooterColumn title="Shop" links={shopLinks} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                        <FooterColumn title="Account" links={accountLinks} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                        <FooterColumn title="Help" links={helpLinks} />
                    </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'rur.panelBorder' }}>
                    RuR - Ready. Up. Repeat. &copy; 2026, All Rights Reserved
                </Typography>
            </Container>
        </Box>
    )
}

export default Footer
