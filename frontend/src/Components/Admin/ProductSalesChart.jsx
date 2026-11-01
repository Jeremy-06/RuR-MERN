import { useMemo } from 'react'
import RankedBars from './RankedBars'

const formatPercent = (value) => `${Number(value.toFixed(2))}%`

export default function ProductSalesChart({ sales }) {
    const data = useMemo(() => sales.map(item => ({ name: item.name, value: item.percent })), [sales])

    return <RankedBars data={data} format={formatPercent} />
}
