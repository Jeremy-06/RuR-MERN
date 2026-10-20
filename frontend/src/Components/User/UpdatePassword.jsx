import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData';
import axios from 'axios';
import { errMsg, successMsg } from '../Utils/helpers'

const UpdatePassword = () => {
    const [oldPassword, setOldPassword] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    let navigate = useNavigate();

    const updatePassword = async (formData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            }

            setLoading(true)
            await axios.put(`${import.meta.env.VITE_API}/password/update`, formData, config)
            setLoading(false)
            successMsg('password updated')
            navigate('/me')
        } catch (error) {
            setLoading(false)
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        updatePassword({ oldPassword, password })
    }

    return (
        <>
            <MetaData title={'Change Password'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} >
                        <h1 className="mt-2 mb-5">Update Password</h1>
                        <div className="form-group">
                            <label htmlFor="old_password_field">Old Password</label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password_field">New Password</label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update Password</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdatePassword
