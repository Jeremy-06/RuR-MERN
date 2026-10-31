import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import EmptyState from '../Layout/EmptyState'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import OrderInfo from '../Order/OrderInfo'
import Sidebar from './SideBar'
import { clearErrors, getOrderDetails, updateOrder } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants'
import { errMsg, ORDER_STATUSES, successMsg } from '../Utils/helpers'
import { accentTop } from '../../theme'

const ProcessOrder = () => {
    const dispatch = useDispatch()
    const { loading, error, order } = useSelector(state => state.orderDetails)
    const { loading: updating, error: updateError, isUpdated } = useSelector(state => state.order)
    // null until the admin picks a status
    const [status, setStatus] = useState(null)
    let navigate = useNavigate()

    let { id } = useParams();

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (updateError) {
            errMsg(updateError)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('Order updated successfully');
            dispatch({ type: UPDATE_ORDER_RESET })
            navigate('/admin/orders')
        }
    }, [dispatch, updateError, isUpdated, navigate])

    const selectedStatus = status || (order ? order.orderStatus : '')
    const isDelivered = order && order.orderStatus === 'Delivered'

    const updateOrderHandler = () => {
        dispatch(updateOrder(id, { status: selectedStatus }))
    }

    return (
        <>
            <MetaData title={`Process Order # ${id}`} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    {error ? (
                        <Box sx={{ mt: { xs: 3, md: 5 } }}>
                            <EmptyState
                                icon={<ErrorOutlinedIcon />}
                                title="Could not load this order"
                                message={error}
                                action={<Button component={Link} to="/admin/orders" variant="contained">Back to All Orders</Button>}
                            />
                        </Box>
                    ) : (loading || !order) ? <Loader /> : (
                        <>
                            <PageHeader title={`Order # ${order._id}`} />
                            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <OrderInfo order={order} showPaymentId />
                                </Grid>
                                <Grid size={{ xs: 12, lg: 4 }} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
                                    <Card sx={{ ...accentTop, height: 'auto', p: { xs: 2, sm: 3 } }}>
                                        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>Status</Typography>
                                        <TextField
                                            id="order_status_field"
                                            select
                                            size="small"
                                            margin="none"
                                            label="Order status"
                                            name="status"
                                            value={selectedStatus}
                                            onChange={(e) => setStatus(e.target.value)}
                                            disabled={isDelivered}
                                        >
                                            {ORDER_STATUSES.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                        </TextField>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={updateOrderHandler}
                                            disabled={isDelivered || updating || selectedStatus === order.orderStatus}
                                            sx={{ mt: 2 }}
                                        >
                                            Update Status
                                        </Button>
                                        {isDelivered && (
                                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>Delivered orders can no longer change.</Typography>
                                        )}
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Grid>
        </>
    )
}

export default ProcessOrder
