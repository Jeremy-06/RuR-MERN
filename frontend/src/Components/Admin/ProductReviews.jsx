import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import EmptyState from '../Layout/EmptyState'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import AdminDataGrid, { PersonCell, RowAction } from './AdminDataGrid'
import { errMsg, formatDateTime, successMsg } from '../Utils/helpers'

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
    const [productId, setProductId] = useState('')
    const [products, setProducts] = useState([])
    const [listReviews, setListReviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(null)

    const getAdminProducts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, { withCredentials: true })
            setProducts(data.products)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }, [])

    const getProductReviews = useCallback(async (id) => {
        setLoading(true)
        setLoadError(null)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/reviews?id=${id}`, { withCredentials: true })
            setListReviews(data.reviews)
        } catch (error) {
            setListReviews([])
            setLoadError(error.response ? error.response.data.message : error.message)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        getAdminProducts()
    }, [getAdminProducts])

    const deleteReview = useCallback(async (id, product) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/review/${id}`, { withCredentials: true })
            if (data.success) {
                successMsg('Review deleted successfully')
                getProductReviews(product)
                // Review counts in the product list changed
                getAdminProducts()
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }, [getAdminProducts, getProductReviews])

    const deleteReviewHandler = useCallback((id, product) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(id, product)
            }
        })
    }, [deleteReview])

    const productChangeHandler = (e) => {
        const id = e.target.value
        setProductId(id)
        if (id === '') {
            setListReviews([])
            setLoadError(null)
        } else {
            getProductReviews(id)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (productId !== '') {
            getProductReviews(productId)
        }
    }

    const renderActions = useCallback((row) => (
        <>
            <RowAction label="View" subject={`product ${row.product}`} icon={<VisibilityOutlinedIcon fontSize="small" />} to={`/product/${row.productId}`} />
            <RowAction label="Delete" subject={`review by ${row.customer}`} icon={<DeleteOutlinedIcon fontSize="small" />} color="error" onClick={() => deleteReviewHandler(row.id, row.productId)} />
        </>
    ), [deleteReviewHandler])

    const rows = useMemo(() => listReviews.map(review => {
        const product = products.find(item => item._id === review.product)
        return {
            id: review._id,
            productId: review.product,
            product: product ? product.name : '',
            customer: review.user ? review.user.name : 'Deleted user',
            avatar: review.user && review.user.avatar ? review.user.avatar.url : '',
            rating: review.rating,
            comment: review.comment,
            date: new Date(review.createdAt),
        }
    }), [listReviews, products])

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
                        <Box component="form" onSubmit={submitHandler} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2 }}>
                            <TextField
                                id="productId_field"
                                select
                                size="small"
                                margin="none"
                                label="Select Product"
                                value={productId}
                                onChange={productChangeHandler}
                            >
                                <MenuItem value="">Choose a product</MenuItem>
                                {products.map(product => (
                                    <MenuItem key={product._id} value={product._id}>
                                        {product.name} ({product.reviewCount} reviews)
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button id="search_button" type="submit" variant="contained" disabled={productId === '' || loading} sx={{ flexShrink: 0 }}>
                                Search
                            </Button>
                        </Box>
                    </Card>

                    {productId === '' ? (
                        <EmptyState icon={<StarBorderOutlinedIcon />} title="Choose a product" message="Its reviews will show up here." />
                    ) : (
                        <AdminDataGrid
                            label="Product reviews"
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            error={loadError}
                            onRetry={() => getProductReviews(productId)}
                            empty={{ icon: <StarBorderOutlinedIcon />, title: 'No reviews yet', message: 'This product has no reviews.' }}
                            renderActions={renderActions}
                            sortField="date"
                        />
                    )}
                </Grid>
            </Grid>
        </>
    )
}

export default ProductReviews
