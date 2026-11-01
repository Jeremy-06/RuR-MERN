import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'

const ProductCardSkeleton = () => {
    return (
        <Card aria-hidden="true">
            <Skeleton variant="rectangular" sx={{ width: '100%', height: 'auto', aspectRatio: '4 / 3' }} />
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Skeleton width="40%" />
                <Skeleton width="90%" height={28} />
                <Skeleton width="60%" />
                <Skeleton width="50%" height={40} sx={{ mt: 1 }} />
            </Box>
        </Card>
    )
}

export default ProductCardSkeleton
