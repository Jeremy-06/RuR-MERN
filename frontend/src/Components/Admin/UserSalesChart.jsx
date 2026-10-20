import { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import axios from "axios";
import Loader from '../Layout/Loader';
import { errMsg } from '../Utils/helpers'

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

    const userSales = async () => {
        try {
            const config = {
                withCredentials: true
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, config)
            setSales(data.customerSales)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const barColors = ["#1677ff", "#fb334b", "#14b8a6"]

    useEffect(() => {
        userSales()
    }, [])

    if (loading) return <Loader />
    if (sales.length === 0) return <p className="text-center text-muted my-5">No sales yet.</p>

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sales}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total">
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
export default UserSalesChart
