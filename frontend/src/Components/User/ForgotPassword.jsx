import { useState, } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { errMsg, successMsg } from '../Utils/helpers'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const forgotPassword = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            setLoading(true)
            const { data } = await axios.post(`${import.meta.env.VITE_API}/password/forgot`, formData, config)
            setLoading(false)
            successMsg(data.message)
            navigate('/login')
        } catch (error) {
            setLoading(false)
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        forgotPassword({ email })
    }

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">Forgot Password</h1>
                        <div className="form-group">
                            <label htmlFor="email_field">Enter Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            id="forgot_password_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading ? true : false} >
                            Send Email
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword
