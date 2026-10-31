import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import EmptyState from '../Layout/EmptyState'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import OrderInfo from './OrderInfo'
import { getOrderDetails } from '../../actions/orderActions'

const OrderDetails = () => {
    const dispatch = useDispatch()
    const { loading, error, order } = useSelector(state => state.orderDetails)
    let { id } = useParams();

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    return (
        <>
            <MetaData title={'Order Details'} />

            {error ? (
                <EmptyState
                    icon={<ErrorOutlinedIcon />}
                    title="Could not load this order"
                    message={error}
                    action={<Button component={Link} to="/orders/me" variant="contained">Back to My Orders</Button>}
                />
            ) : (loading || !order) ? <Loader /> : (
                <>
                    <PageHeader title={`Order # ${order._id}`} />
                    <OrderInfo order={order} />
                </>
            )}
        </>
    )
}

export default OrderDetails
