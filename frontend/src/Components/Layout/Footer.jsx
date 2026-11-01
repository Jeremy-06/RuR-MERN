import { useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { accentGradient, darkTexture } from '../../theme'
import { getCategories } from '../../actions/productActions'
import { isShop, scrollPageToTop } from '../Utils/helpers'

const FOOTER_CATEGORIES = 3

const FooterGroup = ({ title, links, sx }) => (
    <Box component="nav" aria-label={title} sx={sx}>
        <Typography variant="h6" component="h2" sx={{ color: '#fff', mb: 0.5 }}>{title}</Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.25 }}>
            {links.map(link => (
                <li key={link.to}>
                    <Link
                        component={RouterLink}
                        to={link.to}
                        variant="body2"
                        onClick={scrollPageToTop}
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
    const { pathname } = useLocation()
    const { categories } = useSelector(state => state.categories)
    const { user } = useSelector(state => state.auth)
    const { hasMore, error } = useSelector(state => state.products)

    useEffect(() => {
        if (!categories) dispatch(getCategories())
    }, [dispatch, categories])

    // Sa shop, lalabas lang sa dulo ng listahan, walang resulta, o may error
    if (isShop(pathname) && hasMore && !error) return null

    const shopLinks = [
        { to: '/', label: 'All products' },
        ...(categories || []).slice(0, FOOTER_CATEGORIES).map(category => ({ to: `/?category=${encodeURIComponent(category)}`, label: category })),
    ]
    const accountLinks = [
        user ? { to: '/me', label: 'Profile' } : { to: '/login', label: 'Login' },
        { to: '/orders/me', label: 'My Orders' },
        { to: '/cart', label: 'Cart' },
    ]
    // Walang password ang Google accounts, kaya walang Help link
    let helpLinks = [{ to: '/password/forgot', label: 'Forgot password' }]
    if (user) helpLinks = user.authProvider === 'google' ? [] : [{ to: '/password/update', label: 'Change password' }]

    return (
        <Box component="footer" sx={{ mt: 4, bgcolor: 'rur.black', backgroundImage: darkTexture, color: 'rur.muted' }}>
            <Container sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' }, columnGap: 6, rowGap: 2, py: 2 }}>
                <Box>
                    <span className="brand-mark footer-mark">R<span>u</span>R</span>
                    <Typography variant="body2" sx={{ mt: 1, color: '#fff', fontWeight: 700 }}>Ready. Up. Repeat.</Typography>
                    <Typography variant="body2" sx={{ color: '#c9d0da', maxWidth: 320 }}>Gear for every late night and every new high score.</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, columnGap: 3, rowGap: 1.5 }}>
                    <FooterGroup title="Shop" links={shopLinks} sx={{ gridRow: { xs: 'span 2', sm: 'auto' } }} />
                    <FooterGroup title="Account" links={accountLinks} />
                    {helpLinks.length > 0 && <FooterGroup title="Help" links={helpLinks} />}
                </Box>
            </Container>
            <Container>
                <Typography variant="body2" sx={{ py: 1, borderTop: 1, borderColor: 'rur.panelBorder' }}>&copy; 2026 RuR. All rights reserved.</Typography>
            </Container>
            <Box aria-hidden="true" sx={{ height: 2, background: accentGradient }} />
        </Box>
    )
}

export default Footer
