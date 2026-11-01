import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { clipCorners, darkTexture, riseIn } from '../../theme'
import { formatMoney } from '../Utils/helpers'

const FREE_SHIPPING_OVER = 200

const HeroProduct = ({ product, large, delay }) => (
    <Box
        component={Link}
        to={`/product/${product._id}`}
        aria-label={`${product.name}, ${formatMoney(product.price)}`}
        sx={{
            ...riseIn(delay),
            position: 'relative',
            display: 'block',
            overflow: 'hidden',
            minHeight: 0,
            gridRow: large ? 'span 2' : undefined,
            clipPath: clipCorners(12),
            bgcolor: 'rur.panel',
            color: '#fff',
            '&:hover img': { transform: 'scale(1.05)' },
            '&:focus-visible': { outline: '2px solid #fff', outlineOffset: -5 },
        }}
    >
        <Box
            component="img"
            src={product.images[0] ? product.images[0].url : '/images/default_avatar.svg'}
            alt=""
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 250ms ease' }}
        />
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 1.5, background: 'linear-gradient(transparent, rgba(9, 11, 15, 0.92))' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{product.name}</Typography>
            <Typography variant="h6" component="p">{formatMoney(product.price)}</Typography>
        </Box>
    </Box>
)

const HomeHero = ({ products, productsCount, categoriesCount }) => {
    const shopNow = () => {
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        document.getElementById('products').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' })
    }

    const facts = [
        productsCount > 0 && `${productsCount} products`,
        categoriesCount > 0 && `${categoriesCount} categories`,
        `Free shipping over $${FREE_SHIPPING_OVER}`,
    ].filter(Boolean)

    return (
        <Box
            component="section"
            aria-label="Welcome"
            sx={{
                mt: 3,
                p: { xs: 3, md: 5 },
                display: 'grid',
                gap: { xs: 3, md: 5 },
                alignItems: 'center',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: products.length > 0 ? 'minmax(0, 5fr) minmax(0, 6fr)' : 'minmax(0, 1fr)' },
                color: '#fff',
                bgcolor: 'rur.black',
                backgroundImage: `radial-gradient(60% 90% at 88% 10%, rgba(15, 107, 224, 0.35), transparent), radial-gradient(45% 70% at 60% 100%, rgba(251, 51, 75, 0.2), transparent), ${darkTexture}`,
                clipPath: clipCorners(28),
            }}
        >
            <Box>
                <Typography variant="overline" component="p" sx={{ ...riseIn(0), color: '#a8cbff' }}>Built for your next level</Typography>
                <Typography variant="h1" component="p" sx={{ ...riseIn(60), my: 1 }}>
                    Your game. Your <Box component="span" sx={{ color: 'primary.main' }}>ground.</Box>
                </Typography>
                <Typography sx={{ ...riseIn(120), maxWidth: 480, color: '#c9d0da' }}>
                    Gear that keeps up with every clutch, every late night, every new high score.
                </Typography>
                <Box sx={{ ...riseIn(180), mt: 3 }}>
                    <Button variant="contained" size="large" endIcon={<ArrowDownwardIcon />} onClick={shopNow}>Shop the gear</Button>
                </Box>
                <Box component="ul" sx={{ ...riseIn(240), listStyle: 'none', m: 0, mt: 3, p: 0, display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 0.5, color: '#c9d0da' }}>
                    {facts.map(fact => <Typography key={fact} component="li" variant="body2" sx={{ fontWeight: 500 }}>{fact}</Typography>)}
                </Box>
            </Box>

            {products.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gap: 1.5,
                    height: { xs: 260, sm: 320, md: 360 },
                    gridTemplateColumns: products.length > 1 ? 'minmax(0, 3fr) minmax(0, 2fr)' : 'minmax(0, 1fr)',
                    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                }}>
                    {products.map((product, index) => (
                        <HeroProduct key={product._id} product={product} large={index === 0} delay={120 + index * 80} />
                    ))}
                </Box>
            )}
        </Box>
    )
}

export default HomeHero
