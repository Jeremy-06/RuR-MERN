import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import EmptyState from '../Layout/EmptyState'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import AdminDataGrid, { PersonCell, RowAction } from './AdminDataGrid'
import ProductPicker from './ProductPicker'
import { clearErrors, deleteReview, getProductDetails, getProductReviews } from '../../actions/productActions'
import { DELETE_REVIEW_RESET } from '../../constants/productConstants'
import { errMsg, formatDateTime, isProductId, successMsg } from '../Utils/helpers'

const columns = [
    {
        field: 'product',
        headerName: 'Product',
        flex: 1.2,
        minWidth: 170,
        hideOnSmall: true
    },
    {
        field: 'customer',
        headerName: 'Customer',
        flex: 1,
        minWidth: 160,
        renderCell: ({ row }) => <PersonCell name={row.customer} avatar={row.avatar} />
    },
    {
        field: 'rating',
        headerName: 'Rating',
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        width: 130,
        renderCell: ({ value }) => <Rating value={value} size="small" readOnly />
    },
    {
        field: 'comment',
        headerName: 'Comment',
        flex: 1.6,
        minWidth: 210,
        renderCell: ({ value }) => (
            <Tooltip title={value}>
                <Typography
                    variant="body2"
                    sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', whiteSpace: 'normal', lineHeight: 1.4 }}
                >
                    {value}
                </Typography>
            </Tooltip>
        )
    },
    {
        field: 'date',
        headerName: 'Date',
        type: 'date',
        width: 190,
        valueFormatter: formatDateTime
    },
]

const ProductReviews = () => {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    const { product, error: productError } = useSelector(state => state.productDetails)
    const productReviews = useSelector(state => state.productReviews)
    const { error: deleteError, isDeleted } = useSelector(state => state.review)

    // The chosen product lives in the URL so a refresh keeps it
    const productId = searchParams.get('product') || ''
    const validId = isProductId(productId)
    const selected = product._id === productId ? product : null
    const reviews = useMemo(() => productReviews.productId === productId ? productReviews.reviews : [], [productReviews, productId])

    const loadReviews = useCallback(() => dispatch(getProductReviews(productId)), [dispatch, productId])

    useEffect(() => {
        if (!validId) return
        dispatch(getProductDetails(productId))
        loadReviews()
    }, [dispatch, productId, validId, loadReviews])

    useEffect(() => {
        if (deleteError) {
            errMsg(deleteError)
            dispatch(clearErrors())
        }
        if (isDeleted) {
            successMsg('Review deleted successfully')
            dispatch({ type: DELETE_REVIEW_RESET })
            loadReviews()
        }
    }, [dispatch, deleteError, isDeleted, loadReviews])

    // A not found message must not follow the admin to the product page
    useEffect(() => () => {
        dispatch(clearErrors())
    }, [dispatch])

    const deleteReviewHandler = useCallback((id) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteReview(id))
            }
        })
    }, [dispatch])

    const renderActions = useCallback((row) => (
        <>
            <RowAction label="View" subject={`product ${row.product}`} icon={<VisibilityOutlinedIcon fontSize="small" />} to={`/product/${row.productId}`} />
            <RowAction label="Delete" subject={`review by ${row.customer}`} icon={<DeleteOutlinedIcon fontSize="small" />} color="error" onClick={() => deleteReviewHandler(row.id)} />
        </>
    ), [deleteReviewHandler])

    const rows = useMemo(() => reviews.map(review => ({
        id: review._id,
        productId: review.product,
        product: selected ? selected.name : '',
        customer: review.user ? review.user.name : 'Deleted user',
        avatar: review.user && review.user.avatar ? review.user.avatar.url : '',
        rating: review.rating,
        comment: review.comment,
        date: new Date(review.createdAt),
    })), [reviews, selected])

    const selectProduct = (id) => setSearchParams({ product: id })

    let content
    if (!productId) {
        content = <EmptyState icon={<StarBorderOutlinedIcon />} title="Choose a product" message="Its reviews will show up here." />
    } else if (!validId) {
        content = <EmptyState icon={<ErrorOutlinedIcon />} title="Not a valid product ID" message="A product ID has 24 letters and numbers." />
    } else if (productError) {
        content = <EmptyState icon={<ErrorOutlinedIcon />} title={productError} message="No product has this ID." />
    } else {
        content = (
            <AdminDataGrid
                label="Product reviews"
                rows={rows}
                columns={columns}
                loading={productReviews.loading || productReviews.productId !== productId}
                error={productReviews.error}
                onRetry={loadReviews}
                empty={{ icon: <StarBorderOutlinedIcon />, title: 'No reviews yet', message: 'This product has no reviews.' }}
                renderActions={renderActions}
                sortField="date"
            />
        )
    }

    return (
        <>
            <MetaData title={'Product Reviews'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    <PageHeader title="Reviews" />
                    <Card sx={{ height: 'auto', p: 2, mb: 3 }}>
                        <ProductPicker onSelect={selectProduct} />
                        {selected && (
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mt: 2 }}>
                                <Avatar variant="rounded" src={selected.images[0] ? selected.images[0].url : undefined} alt="" sx={{ width: 44, height: 44 }} />
                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{selected.name}</Typography>
                                    <Typography variant="caption" color="textSecondary" component="div">
                                        {selected.category} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                    </Typography>
                                </Box>
                                <Tooltip title="Clear product">
                                    <IconButton size="small" aria-label="Clear product" onClick={() => setSearchParams({})}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </Card>

                    {content}
                </Grid>
            </Grid>
        </>
    )
}

export default ProductReviews
