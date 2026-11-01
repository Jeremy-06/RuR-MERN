import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import dayjs from 'dayjs'

import EmptyState from '../Layout/EmptyState'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import StatCard from './StatCard'
import MonthlySalesChart from './MonthlySalesChart'
import ProductSalesChart from './ProductSalesChart'
import UserSalesChart from './UserSalesChart'
import { getAdminProducts } from '../../actions/productActions'
import { allOrders, getDashboardSales } from '../../actions/orderActions'
import { allUsers } from '../../actions/userActions'
import { formatMoney } from '../Utils/helpers'

const TREND_DAYS = 30

const daysAgo = (item) => dayjs().diff(dayjs(item.createdAt), 'day', true)
const inLastPeriod = (items) => items.filter(item => daysAgo(item) < TREND_DAYS).length

// Walang percent kung walang benta sa naunang period
const salesTrend = (orders) => {
    const total = (from, to) => orders
        .filter(order => daysAgo(order) >= from && daysAgo(order) < to)
        .reduce((acc, order) => acc + order.totalPrice, 0)
    const current = total(0, TREND_DAYS)
    const previous = total(TREND_DAYS, TREND_DAYS * 2)
    const summary = `${formatMoney(current)} in the last ${TREND_DAYS} days`

    if (previous === 0) return summary
    const change = Math.round((current - previous) / previous * 100)
    return `${summary}, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change)}% from the ${TREND_DAYS} days before`
}

const ChartCard = ({ title, hasData, children }) => (
    <Card sx={{ height: 'auto', p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>{title}</Typography>
        {hasData ? children : <Typography color="textSecondary" sx={{ textAlign: 'center', py: 6 }}>No sales yet.</Typography>}
    </Card>
)

const Dashboard = () => {
    const dispatch = useDispatch()
    const products = useSelector(state => state.adminProducts)
    const orders = useSelector(state => state.allOrders)
    const users = useSelector(state => state.allUsers)
    const sales = useSelector(state => state.dashboardSales)

    const loadDashboard = useCallback(() => {
        dispatch(getAdminProducts())
        dispatch(allOrders())
        dispatch(allUsers())
        dispatch(getDashboardSales())
    }, [dispatch])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    const error = products.error || orders.error || users.error || sales.error
    const loading = products.loading || orders.loading || users.loading || sales.loading
    const outOfStock = products.products.filter(product => product.stock === 0).length

    let content
    if (error) {
        content = (
            <EmptyState
                icon={<ErrorOutlinedIcon />}
                title="Could not load the dashboard"
                message={error}
                action={<Button variant="contained" onClick={loadDashboard}>Try again</Button>}
            />
        )
    } else if (loading) {
        content = <Loader />
    } else {
        content = (
            <>
                <Box sx={{ mb: 2 }}>
                    <StatCard label="Total Amount" value={formatMoney(orders.totalAmount)} icon={<PaidOutlinedIcon />} trend={salesTrend(orders.orders)} dark />
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, lg: 3 }}>
                        <StatCard label="Products" value={products.products.length} icon={<SportsEsportsOutlinedIcon />} trend={`${inLastPeriod(products.products)} added in ${TREND_DAYS} days`} to="/admin/products" />
                    </Grid>
                    <Grid size={{ xs: 6, lg: 3 }}>
                        <StatCard label="Orders" value={orders.orders.length} icon={<ShoppingBasketOutlinedIcon />} trend={`${inLastPeriod(orders.orders)} in ${TREND_DAYS} days`} to="/admin/orders" />
                    </Grid>
                    <Grid size={{ xs: 6, lg: 3 }}>
                        <StatCard label="Users" value={users.users.length} icon={<PeopleOutlinedIcon />} trend={`${inLastPeriod(users.users)} joined in ${TREND_DAYS} days`} to="/admin/users" />
                    </Grid>
                    <Grid size={{ xs: 6, lg: 3 }}>
                        <StatCard
                            label="Out of Stock"
                            value={outOfStock}
                            icon={<Inventory2OutlinedIcon />}
                            trend={products.products.length > 0 ? `${Math.round(outOfStock / products.products.length * 100)}% of the catalog` : undefined}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid size={12}>
                        <ChartCard title="Monthly Sales" hasData={sales.monthly.length > 0}>
                            <MonthlySalesChart sales={sales.monthly} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <ChartCard title="Sales per Customer" hasData={sales.customers.length > 0}>
                            <UserSalesChart sales={sales.customers} />
                        </ChartCard>
                    </Grid>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <ChartCard title="Sales per Product (%)" hasData={sales.products.length > 0}>
                            <ProductSalesChart sales={sales.products} />
                        </ChartCard>
                    </Grid>
                </Grid>
            </>
        )
    }

    return (
        <>
            <MetaData title={'Admin Dashboard'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>

                <Grid size={{ xs: 12, md: 10 }}>
                    <PageHeader title="Dashboard" />
                    {content}
                </Grid>
            </Grid>
        </>
    )
}

export default Dashboard
