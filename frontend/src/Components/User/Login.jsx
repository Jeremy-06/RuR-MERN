import { useEffect } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'

import MetaData from '../Layout/MetaData';
import { errMsg } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearErrors } from '../../actions/userActions'
import AuthCard from './AuthCard'
import GoogleLogin from './GoogleLogin'
import PasswordField from './PasswordField'

const loginSchema = Yup.object({
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
    password: Yup.string().required('Please enter your password'),
})

const Login = () => {
    const { isAuthenticated, error, loading, } = useSelector(state => state.auth)
    let navigate = useNavigate()
    let location = useLocation()
    const dispatch = useDispatch()

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: (values) => {
            dispatch(login(values.email.trim(), values.password))
        }
    })

    useEffect(() => {
        if (isAuthenticated && redirect) {
            navigate(`/${redirect}`)
        }
        else if (isAuthenticated)
            navigate('/')
        if (error) {
            errMsg(error)
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, dispatch, navigate, redirect])

    return (
        <>
            <MetaData title={'Login'} />

            <AuthCard brandPanel title="Login" onSubmit={formik.handleSubmit}>
                <TextField
                    id="email_field"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    {...formik.getFieldProps('email')}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <PasswordField formik={formik} name="password" id="password_field" label="Password" autoComplete="current-password" />

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                    <Link component={RouterLink} to="/password/forgot" variant="body2" sx={{ color: 'primary.dark' }}>Forgot Password?</Link>
                </Box>

                <Button id="login_button" type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                    LOGIN
                </Button>

                <Divider sx={{ mt: 3 }}>or</Divider>
                <GoogleLogin />

                <Box sx={{ textAlign: 'right', mt: 3 }}>
                    <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.dark' }}>New User?</Link>
                </Box>
            </AuthCard>
        </>
    )
}
export default Login
