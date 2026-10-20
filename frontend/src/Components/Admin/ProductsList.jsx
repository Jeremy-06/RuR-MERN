import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import axios from 'axios'
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers'
import { DataGrid, } from '@mui/x-data-grid'

const ProductsList = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        withCredentials: true
    }

    const getAdminProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)
            setProducts(data.products)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        getAdminProducts()

        if (isDeleted) {
            successMsg('Product deleted successfully')
            setIsDeleted(false)
        }
    }, [isDeleted])

    const deleteProduct = async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, config)
            setIsDeleted(data.success)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const deleteProductHandler = (id) => {
        Swal.fire({
            title: 'Delete Product',
            icon: 'warning',
            text: 'Do you want to delete this product?',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(id)
            }
        })
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Product ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 120,
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 100,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width: 90,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/product/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteProductHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: `$${product.price}`,
        stock: product.stock,
    }));

    return (
        <>
            <MetaData title={'All Products'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Products</h1>

                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                    pageSizeOptions={[5, 10, 25]}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default ProductsList
