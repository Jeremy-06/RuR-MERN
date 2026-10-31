import { useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import MetaData from '../Layout/MetaData'
import OrderStatusChip from '../Layout/OrderStatusChip'
import PageHeader from '../Layout/PageHeader'
import AdminDataGrid, { IdCell, RowAction } from '../Admin/AdminDataGrid'
import { myOrders } from '../../actions/orderActions'
import { formatDateTime, formatMoney, ORDER_STATUSES } from '../Utils/helpers'

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
        field: 'numOfItems',
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
        sortComparator: (a, b) => ORDER_STATUSES.indexOf(a) - ORDER_STATUSES.indexOf(b),
        renderCell: ({ value }) => <OrderStatusChip status={value} />
    },
]

const renderActions = (row) => (
    <RowAction label="View" subject={`order ${row.id}`} icon={<VisibilityOutlinedIcon fontSize="small" />} to={`/order/${row.id}`} />
)

const ListOrders = () => {
    const dispatch = useDispatch()
    const { loading, error, orders } = useSelector(state => state.myOrders)

    const loadOrders = useCallback(() => dispatch(myOrders()), [dispatch])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    const rows = useMemo(() => orders.map(order => ({
        id: order._id,
        date: new Date(order.createdAt),
        numOfItems: order.orderItems.length,
        amount: order.totalPrice,
        status: order.orderStatus || ''
    })), [orders])

    return (
        <>
            <MetaData title={'My Orders'} />
            <PageHeader title="My Orders" />
            <AdminDataGrid
                label="My orders"
                rows={rows}
                columns={columns}
                loading={loading}
                error={error}
                onRetry={loadOrders}
                empty={{
                    icon: <ReceiptLongOutlinedIcon />,
                    title: 'No orders yet',
                    message: 'Your orders will show up here.',
                    action: <Button component={Link} to="/" variant="contained">Browse products</Button>
                }}
                renderActions={renderActions}
                sortField="date"
            />
        </>
    )
}

export default ListOrders
