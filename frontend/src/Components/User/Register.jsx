import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'

import MetaData from '../Layout/MetaData'
import { avatarSchema, confirmPasswordSchema, errMsg, passwordSchema, readAsDataURL } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearErrors } from '../../actions/userActions'
import AuthCard from './AuthCard'
import AvatarField from './AvatarField'
import GoogleLogin from './GoogleLogin'
import PasswordField from './PasswordField'

const registerSchema = Yup.object({
    name: Yup.string().trim().required('Please enter your name').max(30, 'Your name cannot exceed 30 characters'),
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    avatar: avatarSchema,
})

const Register = () => {
    const { isAuthenticated, error, loading } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    let navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }

        if (error) {
            errMsg(error)
            dispatch(clearErrors());
        }
    }, [dispatch, error, navigate, isAuthenticated])

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', confirmPassword: '', avatar: null },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.set('name', values.name.trim());
            formData.set('email', values.email.trim());
            formData.set('password', values.password);
            formData.set('confirmPassword', values.confirmPassword);
            if (values.avatar) {
                formData.set('avatar', await readAsDataURL(values.avatar));
            }

            await dispatch(register(formData))
        }
    })

    return (
        <>
            <MetaData title={'Register User'} />

            <AuthCard title="Register" onSubmit={formik.handleSubmit}>
                <TextField
                    id="name_field"
                    label="Name"
                    autoComplete="name"
                    {...formik.getFieldProps('name')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />

                <TextField
                    id="email_field"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    {...formik.getFieldProps('email')}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <PasswordField formik={formik} name="password" id="password_field" label="Password" autoComplete="new-password" />
                <PasswordField formik={formik} name="confirmPassword" id="confirm_password_field" label="Confirm password" autoComplete="new-password" />

                <AvatarField formik={formik} />

                <Button id="register_button" type="submit" variant="contained" size="large" fullWidth disabled={loading || formik.isSubmitting} sx={{ mt: 3 }}>
                    REGISTER
                </Button>

                <Divider sx={{ mt: 3 }}>or</Divider>
                <GoogleLogin label="Sign up with Google" />

                <Box sx={{ textAlign: 'right', mt: 3 }}>
                    <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.dark' }}>Already have an account?</Link>
                </Box>
            </AuthCard>
        </>
    )
}

export default Register
