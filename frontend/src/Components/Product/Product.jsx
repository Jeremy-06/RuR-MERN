import { Link } from 'react-router-dom';
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import Box from '@mui/material/Box'

const Product = ({ product }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardActionArea component={Link} to={`/product/${product._id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia
                    component="img"
                    image={product.images[0] ? product.images[0].url : '/images/default_avatar.svg'}
                    alt={product.name}
                    loading="lazy"
                    sx={{ aspectRatio: '4 / 3', objectFit: 'cover', bgcolor: 'background.default' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="overline" color="primary" sx={{ lineHeight: 1.5 }}>{product.category}</Typography>
                    <Typography variant="subtitle1" component="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{product.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={product.averageRating || 0} precision={0.1} size="small" readOnly aria-label={`${product.averageRating || 0} out of 5 stars`} />
                        <Typography variant="body2" color="text.secondary">({product.reviewCount || 0})</Typography>
                    </Box>
                    <Typography variant="h5" component="p" sx={{ mt: 'auto', pt: 1 }}>{`$${Number(product.price).toFixed(2)}`}</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default Product
