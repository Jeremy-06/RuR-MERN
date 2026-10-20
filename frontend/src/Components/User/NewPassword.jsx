import { useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import axios from 'axios';
import { useDispatch } from 'react-redux'
import { loadUser } from '../../actions/userActions'
import { errMsg, successMsg } from '../Utils/helpers'

const NewPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    let navigate = useNavigate();
    const dispatch = useDispatch()
    let { token } = useParams();

    const resetPassword = async (token, passwords) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
            const { data } = await axios.put(`${import.meta.env.VITE_API}/password/reset/${token}`, passwords, config)
            if (data.success) {
                successMsg('password updated')
                dispatch(loadUser())
                navigate('/')
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        resetPassword(token, { password, confirmPassword })
    }

    return (
        <>
            <MetaData title={'New Password Reset'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">New Password</h1>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_password_field">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm_password_field"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            id="new_password_button"
                            type="submit"
                            className="btn btn-block py-3">
                            Set Password
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default NewPassword
