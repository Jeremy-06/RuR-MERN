import { useState, useEffect } from 'react'

import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import Swal from 'sweetalert2'
import axios from 'axios'
import { errMsg, successMsg } from '../Utils/helpers'
import { DataGrid, } from '@mui/x-data-grid'

const ProductReviews = () => {
    const [productId, setProductId] = useState('')
    const [products, setProducts] = useState([])
    const [listReviews, setListReviews] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    }

    const getAdminProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)
            setProducts(data.products)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const getProductReviews = async (id) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/reviews?id=${id}`, config)
            setListReviews(data.reviews)
        } catch (error) {
            setListReviews([])
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const deleteReview = async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/review/${id}`, config)
            setIsDeleted(data.success)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const deleteReviewHandler = (id) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(id)
            }
        })
    }

    useEffect(() => {
        getAdminProducts()
    }, [])

    useEffect(() => {
        if (productId !== '') {
            getProductReviews(productId)
        }

        if (isDeleted) {
            successMsg('Review deleted successfully');
            // Review counts in the product list changed
            getAdminProducts()
            setIsDeleted(false)
        }
    }, [productId, isDeleted])

    const submitHandler = (e) => {
        e.preventDefault();
        if (productId !== '') {
            getProductReviews(productId)
        }
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 90,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 1,
        },
        {
            field: 'user',
            headerName: 'User',
            width: 150,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteReviewHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = listReviews.map(review => ({
        id: review._id,
        comment: review.comment,
        rating: review.rating,
        user: review.user ? review.user.name : 'Deleted user',
    }));

    return (
        <>
            <MetaData title={'Product Reviews'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <div className="row justify-content-center mt-5">
                            <div className="col-12 col-lg-6">
                                <form onSubmit={submitHandler}>
                                    <div className="form-group">
                                        <label htmlFor="productId_field">Select Product</label>
                                        <select
                                            id="productId_field"
                                            className="form-control"
                                            value={productId}
                                            onChange={(e) => setProductId(e.target.value)}
                                        >
                                            <option value="">-- Choose a product --</option>
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} ({product.reviewCount} reviews)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        id="search_button"
                                        type="submit"
                                        className="btn btn-primary btn-block py-2"
                                    >
                                        SEARCH
                                    </button>
                                </form>
                            </div>
                        </div>
                        {listReviews && listReviews.length > 0 ? (
                            <div className="mt-5" style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                                    pageSizeOptions={[5, 10, 25]}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        ) : (
                            <p className="mt-5 text-center">No Reviews.</p>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default ProductReviews
