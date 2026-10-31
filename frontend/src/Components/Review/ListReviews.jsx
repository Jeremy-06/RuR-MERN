import Card from '@mui/material/Card'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const ListReviews = ({ reviews }) => {
    return (
        <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {reviews && reviews.map(review => (
                <Card component="li" key={review._id} sx={{ p: 2.5, height: 'auto' }}>
                    <Rating value={review.rating} size="small" readOnly aria-label={`${review.rating} out of 5 stars`} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        by {review.user ? review.user.name : 'Deleted user'}{review.updatedAt && ' (edited)'}
                    </Typography>
                    <Typography sx={{ mt: 1, overflowWrap: 'anywhere' }}>{review.comment}</Typography>
                </Card>
            ))}
        </Stack>
    )
}

export default ListReviews
