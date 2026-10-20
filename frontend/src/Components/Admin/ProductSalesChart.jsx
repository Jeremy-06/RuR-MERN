import { useState, useEffect } from 'react'
import axios from "axios";
import Loader from '../Layout/Loader';
import { errMsg } from '../Utils/helpers'

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const pieColors = [
        "#1677ff",
        "#fb334b",
        "#14b8a6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#22c55e",
        "#0ea5e9",
        "#f97316",
        "#64748b",
        "#a3e635",
        "#e11d48",
    ]

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${percent}%`}
            </text>
        );
    };

    const productSales = async () => {
        try {
            const config = {
                withCredentials: true
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, config)
            setSales(data.totalPercentage)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        productSales()
    }, [])

    if (loading) return <Loader />
    if (sales.length === 0) return <p className="text-center text-muted my-5">No sales yet.</p>

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="45%"
                    outerRadius="75%"
                    label={renderCustomizedLabel}
                    labelLine={false}
                >
                    {
                        sales.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)
                    }
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ResponsiveContainer>
    );
}
