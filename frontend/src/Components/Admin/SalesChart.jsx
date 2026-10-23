import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { formatMoney, formatPeriod } from '../Utils/helpers'

// One series in the theme blue; grid and axes stay quiet grays.
// Animation is off so a new range swaps in place instead of redrawing from the left
const SERIES_COLOR = '#1677ff'
const GRID_COLOR = '#e6e9ef'
const AXIS_COLOR = '#c9ced6'
const TICK_COLOR = '#5f6774'

const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

// The value leads; the period and order count follow
const SalesTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null
    const period = payload[0].payload

    return (
        <Paper elevation={3} sx={{ px: 1.5, py: 1 }}>
            <Typography variant="caption" color="text.secondary" component="p">{formatPeriod(period)}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{formatMoney(period.total)}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: SERIES_COLOR }} />
                <Typography variant="caption" color="text.secondary">
                    {`Sales · ${period.orders} ${period.orders === 1 ? 'order' : 'orders'} · ${period.items} items`}
                </Typography>
            </Box>
        </Paper>
    )
}

export default function SalesChart({ sales, groupBy, type }) {
    const xAxisProps = {
        dataKey: 'start',
        tickFormatter: value => dayjs(value).format(groupBy === 'month' ? 'MMM YYYY' : 'MMM D'),
        tick: { fill: TICK_COLOR, fontSize: 12 },
        axisLine: { stroke: AXIS_COLOR },
        tickLine: false,
        minTickGap: 24,
    }
    const yAxisProps = {
        tickFormatter: value => compactMoney.format(value),
        tick: { fill: TICK_COLOR, fontSize: 12 },
        axisLine: false,
        tickLine: false,
        width: 60,
    }
    const margin = { top: 8, right: 16, bottom: 0, left: 0 }

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height={340}>
                <BarChart data={sales} margin={margin}>
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<SalesTooltip />} cursor={{ fill: 'rgba(22, 119, 255, 0.06)' }} />
                    <Bar dataKey="total" name="Sales" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} activeBar={{ fill: '#4d97ff' }} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={sales} margin={margin}>
                <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<SalesTooltip />} cursor={{ stroke: AXIS_COLOR, strokeWidth: 1 }} />
                <Area
                    type="linear"
                    dataKey="total"
                    name="Sales"
                    stroke={SERIES_COLOR}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill={SERIES_COLOR}
                    fillOpacity={0.1}
                    activeDot={{ r: 5, fill: SERIES_COLOR, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
