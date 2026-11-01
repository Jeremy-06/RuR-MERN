import { useMemo } from 'react'
import RankedBars from './RankedBars'
import { formatCompactMoney, formatMoney } from '../Utils/helpers'

const UserSalesChart = ({ sales }) => {
    const data = useMemo(() => sales.map(item => ({ name: item.userDetails.name, value: item.total })), [sales])

    return <RankedBars data={data} format={formatMoney} axisFormat={formatCompactMoney} />
}

export default UserSalesChart
