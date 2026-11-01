import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactMoney, formatMoney } from '../Utils/helpers'
import { chartColors } from '../../theme'

export default function MonthlySalesChart({ sales }) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={sales} margin={{ top: 8, right: 32, bottom: 4, left: 8 }}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="month" tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                <YAxis tickFormatter={formatCompactMoney} width={60} tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatMoney(value), 'Sales']} />
                <Line type="monotone" dataKey="total" stroke={chartColors.series} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
