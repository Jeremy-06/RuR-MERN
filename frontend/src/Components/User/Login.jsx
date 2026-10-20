import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import MetaData from '../Layout/MetaData';
import { errMsg } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearErrors } from '../../actions/userActions'
import GoogleLogin from './GoogleLogin'

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

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: { xs: 3, md: 5 }, width: '100%', maxWidth: 480 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 1 }}>Login</Typography>

                    <TextField
                        id="email_field"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    <TextField
                        id="password_field"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        {...formik.getFieldProps('password')}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Link to="/password/forgot">Forgot Password?</Link>
                    </Box>

                    <Button id="login_button" type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                        LOGIN
                    </Button>

                    <Divider sx={{ mt: 3 }}>or</Divider>
                    <GoogleLogin />

                    <Box sx={{ textAlign: 'right', mt: 3 }}>
                        <Link to="/register">New User?</Link>
                    </Box>
                </Paper>
            </Box>
        </>
    )
}
export default Login
