import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'

import MetaData from '../Layout/MetaData'
import { errMsg, readAsDataURL, avatarSchema } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearErrors } from '../../actions/userActions'
import GoogleLogin from './GoogleLogin'

const registerSchema = Yup.object({
    name: Yup.string().trim().required('Please enter your name').max(30, 'Your name cannot exceed 30 characters'),
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
    password: Yup.string().required('Please enter your password').min(6, 'Your password must be at least 6 characters'),
    avatar: avatarSchema,
})

const Register = () => {
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.svg')

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
        initialValues: { name: '', email: '', password: '', avatar: null },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.set('name', values.name.trim());
            formData.set('email', values.email.trim());
            formData.set('password', values.password);
            if (values.avatar) {
                formData.set('avatar', await readAsDataURL(values.avatar));
            }

            dispatch(register(formData))
        }
    })

    const onAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        formik.setFieldTouched('avatar', true, false)
        formik.setFieldValue('avatar', file)
        setAvatarPreview(await readAsDataURL(file))
    }

    return (
        <>
            <MetaData title={'Register User'} />

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: { xs: 3, md: 5 }, width: '100%', maxWidth: 480 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 1 }}>Register</Typography>

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

                    <TextField
                        id="password_field"
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        {...formik.getFieldProps('password')}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Avatar src={avatarPreview} alt="Avatar Preview" sx={{ width: 56, height: 56 }} />
                        <Button variant="outlined" component="label">
                            Choose Avatar
                            <input type="file" name="avatar" hidden accept=".jpg,.jpeg,.png,.webp" onChange={onAvatarChange} />
                        </Button>
                    </Box>
                    {formik.touched.avatar && formik.errors.avatar && (
                        <FormHelperText error>{formik.errors.avatar}</FormHelperText>
                    )}

                    <Button id="register_button" type="submit" variant="contained" size="large" fullWidth disabled={loading || formik.isSubmitting} sx={{ py: 1.5, mt: 3 }}>
                        REGISTER
                    </Button>

                    <Divider sx={{ mt: 3 }}>or</Divider>
                    <GoogleLogin label="Sign up with Google" />

                    <Box sx={{ textAlign: 'right', mt: 3 }}>
                        <Link to="/login">Already have an account?</Link>
                    </Box>
                </Paper>
            </Box>
        </>
    )
}

export default Register
