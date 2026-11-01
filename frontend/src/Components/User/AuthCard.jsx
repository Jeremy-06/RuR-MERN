import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import SectionTitle from '../Layout/SectionTitle'
import { accentTop, clipCorners, darkTexture } from '../../theme'
import { getTopRatedProducts } from '../../actions/productActions'

const PANEL_PRODUCTS = 3

// Totoong products lang; walang images kung wala pang top rated
const BrandPanel = () => {
    const dispatch = useDispatch()
    const { products } = useSelector(state => state.topRatedProducts)
    const featured = products.filter(product => product.images[0]).slice(0, PANEL_PRODUCTS)

    useEffect(() => {
        if (products.length === 0) dispatch(getTopRatedProducts())
    }, [dispatch, products.length])

    return (
        <Box sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 3,
            p: 5,
            color: '#fff',
            bgcolor: 'rur.black',
            backgroundImage: `radial-gradient(70% 70% at 85% 10%, rgba(15, 107, 224, 0.35), transparent), ${darkTexture}`,
        }}>
            <Box>
                <span className="brand-mark">R<span>u</span>R</span>
                <Typography variant="h3" component="p" sx={{ mt: 2 }}>Ready. Up. Repeat.</Typography>
                <Typography sx={{ mt: 1, color: '#c9d0da' }}>Gear that keeps up with every clutch, every late night, every new high score.</Typography>
            </Box>
            {featured.length > 0 && (
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: `repeat(${featured.length}, minmax(0, 1fr))` }}>
                    {featured.map(product => (
                        <Box key={product._id} sx={{ minWidth: 0 }}>
                            <Box
                                component="img"
                                src={product.images[0].url}
                                alt={product.name}
                                sx={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', clipPath: clipCorners(10) }}
                            />
                            <Typography variant="caption" component="p" sx={{ mt: 0.75, color: '#c9d0da', overflowWrap: 'anywhere', lineHeight: 1.3 }}>{product.name}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}

const AuthCard = ({ title, subtitle, onSubmit, children, brandPanel }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: { xs: 3, md: 5 } }}>
            <Card
                sx={{
                    ...accentTop,
                    height: 'auto',
                    width: '100%',
                    maxWidth: brandPanel ? { xs: 520, md: 1040 } : 520,
                    display: 'grid',
                    gridTemplateColumns: brandPanel ? { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' } : 'minmax(0, 1fr)',
                }}
            >
                <Box component="form" noValidate onSubmit={onSubmit} sx={{ p: { xs: 3, md: 5 } }}>
                    <SectionTitle variant="h3" component="h1" sx={{ mb: subtitle ? 1.5 : 2 }}>{title}</SectionTitle>
                    {subtitle && <Typography color="textSecondary" sx={{ mb: 1 }}>{subtitle}</Typography>}
                    {children}
                </Box>
                {brandPanel && <BrandPanel />}
            </Card>
        </Box>
    )
}

export default AuthCard
