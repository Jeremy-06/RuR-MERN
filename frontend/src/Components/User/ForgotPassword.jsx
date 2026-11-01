import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MetaData from '../Layout/MetaData'
import AuthCard from './AuthCard'
import { clearErrors, forgotPassword } from '../../actions/userActions'
import { FORGOT_PASSWORD_RESET } from '../../constants/userConstants'
import { errMsg, successMsg } from '../Utils/helpers'

const forgotSchema = Yup.object({
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
})

const ForgotPassword = () => {
    const dispatch = useDispatch()
    const { loading, error, message } = useSelector(state => state.forgotPassword)
    const navigate = useNavigate()

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (message) {
            successMsg(message)
            dispatch({ type: FORGOT_PASSWORD_RESET })
            navigate('/login')
        }
    }, [dispatch, error, message, navigate])

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema: forgotSchema,
        onSubmit: (values) => {
            dispatch(forgotPassword(values.email.trim()))
        }
    })

    return (
        <>
            <MetaData title={'Forgot Password'} />

            <AuthCard brandPanel title="Forgot Password" subtitle="We will email you a link to set a new password." onSubmit={formik.handleSubmit}>
                <TextField
                    id="email_field"
                    label="Enter Email"
                    type="email"
                    autoComplete="email"
                    {...formik.getFieldProps('email')}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <Button id="forgot_password_button" type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
                    {loading ? 'Sending…' : 'Send Email'}
                </Button>
            </AuthCard>
        </>
    )
}

export default ForgotPassword
