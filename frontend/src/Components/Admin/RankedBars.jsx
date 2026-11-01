import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../theme'

const MAX_BARS = 8
const BAR_HEIGHT = 40

// Sobra sa top bars, sa Other na
const RankedBars = ({ data, format, axisFormat = format }) => {
    const rows = useMemo(() => {
        const sorted = [...data].sort((a, b) => b.value - a.value)
        if (sorted.length <= MAX_BARS) return sorted
        const rest = sorted.slice(MAX_BARS - 1)
        return [
            ...sorted.slice(0, MAX_BARS - 1),
            { name: `Other (${rest.length})`, value: rest.reduce((sum, item) => sum + item.value, 0) },
        ]
    }, [data])

    return (
        <ResponsiveContainer width="100%" height={rows.length * BAR_HEIGHT + 40}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid horizontal={false} stroke={chartColors.grid} />
                <XAxis type="number" tickFormatter={axisFormat} tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [format(value), 'Sales']} cursor={{ fill: 'rgba(15, 107, 224, 0.06)' }} />
                <Bar dataKey="value" fill={chartColors.series} barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default RankedBars
