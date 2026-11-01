import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import Grid from '@mui/material/Grid'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import MetaData from '../Layout/MetaData'
import OrderStatusChip from '../Layout/OrderStatusChip'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import AdminDataGrid, { IdCell, PersonCell, RowAction } from './AdminDataGrid'
import { allOrders, clearErrors, deleteOrder } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'
import { errMsg, formatDateTime, formatMoney, ORDER_STATUSES, successMsg } from '../Utils/helpers'

const columns = [
    {
        field: 'id',
        headerName: 'Order ID',
        flex: 1,
        minWidth: 150,
        renderCell: ({ value }) => <IdCell id={value} label="Order" />
    },
    {
        field: 'date',
        headerName: 'Date',
        type: 'date',
        flex: 1.2,
        minWidth: 190,
        valueFormatter: formatDateTime
    },
    {
        field: 'customer',
        headerName: 'Customer',
        flex: 1.6,
        minWidth: 170,
        renderCell: ({ row }) => <PersonCell name={row.customerName} detail={row.customerEmail} hideDetail />
    },
    {
        field: 'items',
        headerName: 'Items',
        type: 'number',
        width: 84,
        hideOnSmall: true
    },
    {
        field: 'amount',
        headerName: 'Amount',
        type: 'number',
        width: 116,
        valueFormatter: formatMoney
    },
    {
        field: 'status',
        headerName: 'Status',
        type: 'singleSelect',
        valueOptions: ORDER_STATUSES,
        width: 130,
        // Sort by progress, hindi alphabetical
        sortComparator: (a, b) => ORDER_STATUSES.indexOf(a) - ORDER_STATUSES.indexOf(b),
        renderCell: ({ value }) => <OrderStatusChip status={value} />
    },
]

const OrdersList = () => {
    const dispatch = useDispatch()
    const { loading, error, orders } = useSelector(state => state.allOrders)
    const { error: deleteError, isDeleted } = useSelector(state => state.order)

    const loadOrders = useCallback(() => dispatch(allOrders()), [dispatch])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    useEffect(() => {
        if (deleteError) {
            errMsg(deleteError)
            dispatch(clearErrors())
        }
        if (isDeleted) {
            successMsg('Order deleted successfully')
            dispatch({ type: DELETE_ORDER_RESET })
            loadOrders()
        }
    }, [dispatch, deleteError, isDeleted, loadOrders])

    const deleteOrderHandler = useCallback((id) => {
        Swal.fire({
            title: 'Delete Order',
            icon: 'warning',
            text: 'Do you want to delete this order?',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteOrder(id))
            }
        })
    }, [dispatch])

    const renderActions = useCallback((row) => (
        <>
            <RowAction label="View" subject={`order ${row.id}`} icon={<VisibilityOutlinedIcon fontSize="small" />} to={`/admin/order/${row.id}`} />
            <RowAction label="Delete" subject={`order ${row.id}`} icon={<DeleteOutlinedIcon fontSize="small" />} color="error" onClick={() => deleteOrderHandler(row.id)} />
        </>
    ), [deleteOrderHandler])

    const rows = useMemo(() => orders.map(order => {
        const customerName = order.user ? order.user.name : 'Deleted user'
        const customerEmail = order.user ? order.user.email : ''
        return {
            id: order._id,
            date: new Date(order.createdAt),
            // Pinagsama para mag-match ang search at filters sa dalawa
            customer: `${customerName} ${customerEmail}`.trim(),
            customerName,
            customerEmail,
            items: order.orderItems.length,
            amount: order.totalPrice,
            status: order.orderStatus,
        }
    }), [orders])

    return (
        <>
            <MetaData title={'All Orders'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    <PageHeader title="All Orders" />
                    <AdminDataGrid
                        label="All orders"
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={loadOrders}
                        empty={{ icon: <ReceiptLongOutlinedIcon />, title: 'No orders yet', message: 'New orders will show up here.' }}
                        renderActions={renderActions}
                        sortField="date"
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default OrdersList
