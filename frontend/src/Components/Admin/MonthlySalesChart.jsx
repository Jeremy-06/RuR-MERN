import { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "axios";
import Loader from '../Layout/Loader';
import { errMsg } from '../Utils/helpers'

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    const monthlySales = async () => {
        try {
            const config = {
                withCredentials: true
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config)
            setSales(data.salesPerMonth)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        monthlySales()
    }, [])

    if (loading) return <Loader />
    if (sales.length === 0) return <p className="text-center text-muted my-5">No sales yet.</p>

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#1677ff" strokeWidth={3} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}
