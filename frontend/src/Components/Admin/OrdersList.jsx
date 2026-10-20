import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import axios from 'axios'
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers'
import { DataGrid, } from '@mui/x-data-grid'

const OrdersList = () => {
    const [loading, setLoading] = useState(true)
    const [allOrders, setAllOrders] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        withCredentials: true
    }

    const listOrders = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
            setAllOrders(data.orders)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const deleteOrder = async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
            setIsDeleted(data.success)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        listOrders()
        if (isDeleted) {
            successMsg('Order deleted successfully');
            setIsDeleted(false)
        }
    }, [isDeleted])

    const deleteOrderHandler = (id) => {
        Swal.fire({
            title: 'Delete Order',
            icon: 'warning',
            text: 'Do you want to delete this order?',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteOrder(id)
            }
        })
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',
            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) =>
                (params.value && String(params.value).includes('Delivered'))
                    ? <span style={{ color: 'green' }}>{params.value}</span>
                    : <span style={{ color: 'red' }}>{params.value}</span>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/order/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-eye"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteOrderHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = allOrders.map(order => ({
        id: order._id,
        numofItems: order.orderItems.length,
        amount: `$${order.totalPrice}`,
        status: order.orderStatus,
    }));

    return (
        <>
            <MetaData title={'All Orders'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Orders</h1>
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

export default OrdersList
