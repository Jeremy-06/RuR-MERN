import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompactMoney, formatMoney } from '../Utils/helpers'

const AXIS_COLOR = '#5b6573'

export default function MonthlySalesChart({ sales }) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={sales} margin={{ top: 8, right: 32, bottom: 4, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#e3e7ee" />
                <XAxis dataKey="month" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={{ stroke: '#e3e7ee' }} tickLine={false} />
                <YAxis tickFormatter={formatCompactMoney} width={60} tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatMoney(value), 'Sales']} />
                <Line type="monotone" dataKey="total" stroke="#0f6be0" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
