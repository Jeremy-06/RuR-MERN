import { useEffect, useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import SalesChart from './SalesChart'
import { errMsg, formatMoney, formatPeriod } from '../Utils/helpers'

// Each preset also picks a grouping, so long ranges are not drawn day by day
const presets = [
    { value: '7d', label: 'Last 7 days', groupBy: 'day', start: today => today.subtract(6, 'day') },
    { value: '30d', label: 'Last 30 days', groupBy: 'day', start: today => today.subtract(29, 'day') },
    { value: '90d', label: 'Last 90 days', groupBy: 'week', start: today => today.subtract(89, 'day') },
    { value: 'month', label: 'This month', groupBy: 'day', start: today => today.startOf('month') },
    { value: 'year', label: 'This year', groupBy: 'month', start: today => today.startOf('year') },
    { value: '12m', label: 'Last 12 months', groupBy: 'month', start: today => today.subtract(11, 'month').startOf('month') },
]

const groupLabels = { day: 'Day', week: 'Week', month: 'Month' }

// Same limit as backend/utils/salesRange.js
const MAX_PERIODS = 366

// Sent with every request so each day starts at midnight where the admin is
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const cardSx = { p: { xs: 2, sm: 2.5 }, borderRadius: '0.6rem', boxShadow: '0 2px 10px rgba(9, 11, 15, 0.08)' }
// Full width on phones, side by side from tablets up
const fieldWidth = { width: { xs: '100%', sm: 170 } }
const pickerProps = { textField: { size: 'small', margin: 'none', fullWidth: false, sx: fieldWidth } }

const SalesDashboard = () => {
    const [preset, setPreset] = useState('30d')
    const [startDate, setStartDate] = useState(() => dayjs().subtract(29, 'day'))
    const [endDate, setEndDate] = useState(() => dayjs())
    const [dateErrors, setDateErrors] = useState({ start: null, end: null })
    const [groupBy, setGroupBy] = useState('day')
    const [view, setView] = useState('line')
    // query names the filters the data was loaded for, so a refetch can dim the old numbers instead of blanking them
    const [report, setReport] = useState({ query: null, data: null, error: null })

    const validDates = startDate && startDate.isValid() && endDate && endDate.isValid()
    const start = validDates ? startDate.format('YYYY-MM-DD') : ''
    const end = validDates ? endDate.format('YYYY-MM-DD') : ''

    let rangeError = ''
    if (!validDates) {
        rangeError = 'Enter a start and an end date'
    } else if (start > end) {
        rangeError = 'The start date must be on or before the end date'
    } else if (dateErrors.start || dateErrors.end) {
        rangeError = 'Dates must be between 1900 and today'
    } else if (groupBy === 'day' && dayjs(end).diff(dayjs(start), 'day') + 1 > MAX_PERIODS) {
        rangeError = 'Group by week or month for ranges longer than a year'
    }

    const query = rangeError ? null : `${start}|${end}|${groupBy}`
    const refreshing = query !== null && report.query !== query
    const { data } = report

    useEffect(() => {
        if (rangeError) return
        const controller = new AbortController()

        const getSales = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-by-date`, {
                    params: { startDate: start, endDate: end, groupBy, timezone },
                    signal: controller.signal,
                    withCredentials: true
                })
                setReport({ query: `${start}|${end}|${groupBy}`, data, error: null })
            } catch (error) {
                // A newer request replaced this one
                if (axios.isCancel(error)) return
                const message = error.response ? error.response.data.message : error.message
                errMsg(message)
                setReport({ query: `${start}|${end}|${groupBy}`, data: null, error: message })
            }
        }

        getSales()
        return () => controller.abort()
    }, [start, end, groupBy, rangeError])

    const presetHandler = (event) => {
        const value = event.target.value
        setPreset(value)

        // Custom range keeps the dates as they are
        const option = presets.find(item => item.value === value)
        if (!option) return
        const today = dayjs()
        setStartDate(option.start(today))
        setEndDate(today)
        setGroupBy(option.groupBy)
    }

    const startDateHandler = (value) => {
        setStartDate(value)
        setPreset('custom')
    }

    const endDateHandler = (value) => {
        setEndDate(value)
        setPreset('custom')
    }

    const stats = data ? [
        { label: 'Total sales', value: formatMoney(data.totalSales) },
        { label: 'Orders', value: data.totalOrders.toLocaleString('en-US') },
        { label: 'Average order', value: formatMoney(data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0) },
        { label: 'Items sold', value: data.totalItems.toLocaleString('en-US') },
    ] : []

    const renderSales = () => {
        if (data.totalOrders === 0) {
            return (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
                    {`No orders from ${formatPeriod({ start: data.startDate, end: data.endDate })}.`}
                </Typography>
            )
        }

        if (view !== 'table') {
            return <SalesChart sales={data.sales} groupBy={data.groupBy} type={view} />
        }

        return (
            <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader aria-label={`Sales per ${data.groupBy}`} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{groupLabels[data.groupBy]}</TableCell>
                            <TableCell align="right">Orders</TableCell>
                            <TableCell align="right">Items sold</TableCell>
                            <TableCell align="right">Sales</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.sales.map(period => (
                            <TableRow key={period.start} hover>
                                <TableCell>{formatPeriod(period)}</TableCell>
                                <TableCell align="right">{period.orders}</TableCell>
                                <TableCell align="right">{period.items}</TableCell>
                                <TableCell align="right">{formatMoney(period.total)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                            <TableCell>Total</TableCell>
                            <TableCell align="right">{data.totalOrders}</TableCell>
                            <TableCell align="right">{data.totalItems}</TableCell>
                            <TableCell align="right">{formatMoney(data.totalSales)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    return (
        <>
            <MetaData title={'Sales Dashboard'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>

                <Grid size={{ xs: 12, md: 10 }}>
                    <Typography variant="h3" component="h1" sx={{ my: 4 }}>Sales</Typography>

                    {/* Filters: everything below follows this range */}
                    <Paper elevation={0} sx={{ ...cardSx, mb: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                                <TextField
                                    select
                                    size="small"
                                    margin="none"
                                    fullWidth={false}
                                    label="Range"
                                    value={preset}
                                    onChange={presetHandler}
                                    sx={fieldWidth}
                                >
                                    {presets.map(option => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                    <MenuItem value="custom">Custom range</MenuItem>
                                </TextField>
                                <DatePicker
                                    label="Start date"
                                    value={startDate}
                                    onChange={startDateHandler}
                                    onError={error => setDateErrors(prev => ({ ...prev, start: error }))}
                                    maxDate={validDates ? endDate : undefined}
                                    disableFuture
                                    slotProps={pickerProps}
                                />
                                <DatePicker
                                    label="End date"
                                    value={endDate}
                                    onChange={endDateHandler}
                                    onError={error => setDateErrors(prev => ({ ...prev, end: error }))}
                                    minDate={validDates ? startDate : undefined}
                                    disableFuture
                                    slotProps={pickerProps}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" id="group-by-label">Group by</Typography>
                                    <ToggleButtonGroup
                                        size="small"
                                        exclusive
                                        value={groupBy}
                                        onChange={(event, value) => value && setGroupBy(value)}
                                        aria-labelledby="group-by-label"
                                    >
                                        {Object.entries(groupLabels).map(([value, label]) => (
                                            <ToggleButton key={value} value={value} sx={{ px: 1.5 }}>{label}</ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Box>
                            </Box>
                        </LocalizationProvider>
                        {rangeError && (
                            <Typography role="alert" variant="body2" color="error" sx={{ mt: 1.5 }}>{rangeError}</Typography>
                        )}
                    </Paper>

                    {!data ? (
                        report.error
                            ? <Typography color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>{`Sales could not be loaded: ${report.error}`}</Typography>
                            : <Loader />
                    ) : (
                        // The previous numbers stay, dimmed, while new ones load
                        <Box aria-busy={refreshing} sx={{ opacity: refreshing ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {stats.map(stat => (
                                    <Grid key={stat.label} size={{ xs: 6, lg: 3 }}>
                                        <Paper elevation={0} sx={{ ...cardSx, height: '100%' }}>
                                            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                                            <Typography sx={{ fontSize: { xs: '1.3rem', sm: '1.75rem' }, fontWeight: 600, lineHeight: 1.3, overflowWrap: 'anywhere' }}>{stat.value}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Paper elevation={0} sx={{ ...cardSx, mb: 4 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                    <Box sx={{ mr: 'auto' }}>
                                        <Typography variant="h5" component="h2">{`Sales per ${data.groupBy}`}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatPeriod({ start: data.startDate, end: data.endDate })}
                                        </Typography>
                                    </Box>
                                    <ToggleButtonGroup
                                        size="small"
                                        exclusive
                                        value={view}
                                        onChange={(event, value) => value && setView(value)}
                                        aria-label="Show sales as"
                                    >
                                        <ToggleButton value="line" sx={{ px: 1.5 }}>Line</ToggleButton>
                                        <ToggleButton value="bar" sx={{ px: 1.5 }}>Bar</ToggleButton>
                                        <ToggleButton value="table" sx={{ px: 1.5 }}>Table</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                {renderSales()}
                            </Paper>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </>
    )
}

export default SalesDashboard
