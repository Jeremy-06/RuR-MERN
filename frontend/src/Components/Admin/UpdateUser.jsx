import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import axios from 'axios';
import { errMsg, successMsg } from '../Utils/helpers'

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    let navigate = useNavigate();

    const { id } = useParams();
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    }

    const getUserDetails = async (id) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${id}`, config)
            setName(data.user.name);
            setEmail(data.user.email);
            setRole(data.user.role)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const updateUser = async (id, userData) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}`, userData, config)
            if (data.success) {
                successMsg('User updated successfully')
                navigate('/admin/users')
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        getUserDetails(id)
    }, [id])

    const submitHandler = (e) => {
        e.preventDefault();
        updateUser(id, { name, email, role })
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    {loading ? <Loader /> : (
                        <div className="row wrapper">
                            <div className="col-10 col-lg-5">
                                <form className="shadow-lg" onSubmit={submitHandler}>
                                    <h1 className="mt-2 mb-5">Update User</h1>
                                    <div className="form-group">
                                        <label htmlFor="name_field">Name</label>
                                        <input
                                            type="name"
                                            id="name_field"
                                            className="form-control"
                                            name='name'
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email_field">Email</label>
                                        <input
                                            type="email"
                                            id="email_field"
                                            className="form-control"
                                            name='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="role_field">Role</label>
                                        <select
                                            id="role_field"
                                            className="form-control"
                                            name='role'
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn update-btn btn-block mt-4 mb-3" >Update</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default UpdateUser
