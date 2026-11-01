import { Link } from 'react-router-dom';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { formatMoney, productBadges } from '../Utils/helpers'
import { accentGradient, clipCorners } from '../../theme'

const IMAGE_RATIO = '4 / 3'
const canAnimate = '@media (hover: hover) and (prefers-reduced-motion: no-preference)'

const badgeTones = {
    blue: { bgcolor: 'primary.dark', color: '#fff' },
    gold: { bgcolor: '#ffc23d', color: '#11151b' },
    alert: { bgcolor: 'error.main', color: '#fff' },
    dark: { bgcolor: 'rur.black', color: '#fff' },
}

const Product = ({ product, onAddToCart }) => {
    const soldOut = product.stock === 0

    return (
        <Card
            className="product-card"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    zIndex: 2,
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: accentGradient,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 200ms ease',
                },
                '&:hover': { borderColor: 'primary.main' },
                '&:hover::before, &:focus-within::before': { transform: 'scaleX(1)' },
                [canAnimate]: {
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 30px rgba(9, 11, 15, 0.22)', borderColor: 'primary.main' },
                    '&:hover img': { transform: 'scale(1.06)' },
                },
            }}
        >
            <CardActionArea component={Link} to={`/product/${product._id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', '&:hover': { color: 'inherit', textDecoration: 'none' } }}>
                <Box sx={{ overflow: 'hidden', bgcolor: 'background.default' }}>
                    <CardMedia
                        component="img"
                        image={product.images[0] ? product.images[0].url : '/images/default_avatar.svg'}
                        alt={product.name}
                        loading="lazy"
                        sx={{ aspectRatio: IMAGE_RATIO, objectFit: 'cover', transition: 'transform 250ms ease', opacity: soldOut ? 0.6 : 1 }}
                    />
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: '0.6875rem' }}>{product.category}</Typography>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{product.name}</Typography>
                    {product.reviewCount > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating value={product.averageRating} precision={0.1} size="small" readOnly aria-label={`${product.averageRating} out of 5 stars`} />
                            <Typography variant="body2" color="textSecondary">({product.reviewCount})</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="textSecondary">No reviews yet</Typography>
                    )}
                    <Typography variant="h4" component="p" sx={{ mt: 'auto', pt: 1 }}>{formatMoney(product.price)}</Typography>
                </CardContent>
            </CardActionArea>

            {/* Kasing taas ng image para nasa ibabaw nito pero wala sa loob ng link */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, aspectRatio: IMAGE_RATIO, pointerEvents: 'none', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                {productBadges(product).map(badge => (
                    <Box
                        key={badge.label}
                        component="span"
                        sx={{
                            ...badgeTones[badge.tone],
                            px: 1.25,
                            py: 0.25,
                            fontFamily: 'h6.fontFamily',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            clipPath: clipCorners(5),
                        }}
                    >
                        {badge.label}
                    </Box>
                ))}
            </Box>

            {/* Sa phones nasa baba ng details para hindi matakpan ang image */}
            {onAddToCart && !soldOut && (
                <Box sx={{
                    px: 1.5,
                    pb: 1.5,
                    '@media (min-width: 600px)': {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        aspectRatio: IMAGE_RATIO,
                        p: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        pointerEvents: 'none',
                    },
                }}>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<AddShoppingCartIcon />}
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() => onAddToCart(product)}
                        sx={{
                            pointerEvents: 'auto',
                            '@media (hover: hover) and (min-width: 600px)': {
                                opacity: 0,
                                transform: 'translateY(6px)',
                                transition: 'opacity 180ms ease, transform 180ms ease, background-color 180ms ease',
                                '.product-card:hover &, &:focus-visible': { opacity: 1, transform: 'none' },
                            },
                        }}
                    >
                        Add to cart
                    </Button>
                </Box>
            )}
        </Card>
    )
}

export default Product
