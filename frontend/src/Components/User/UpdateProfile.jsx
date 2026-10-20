import { useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import FormHelperText from '@mui/material/FormHelperText'
import { useDispatch } from 'react-redux'
import { loadUser } from '../../actions/userActions'
import { errMsg, successMsg, readAsDataURL, avatarSchema } from '../Utils/helpers'

const profileSchema = Yup.object({
    name: Yup.string().trim().required('Please enter your name').max(30, 'Your name cannot exceed 30 characters'),
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
    avatar: avatarSchema,
})

const UpdateProfile = () => {
    const [user, setUser] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.svg')
    let navigate = useNavigate();
    const dispatch = useDispatch()

    const getProfile = async () => {
        const config = {
            withCredentials: true
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
            setUser(data.user)
            setAvatarPreview(data.user.avatar.url)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const updateProfile = async (userData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true
        }
        try {
            await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
            successMsg('user updated')
            dispatch(loadUser())
            navigate('/me', { replace: true })
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        getProfile()
    }, [])

    const formik = useFormik({
        initialValues: { name: user ? user.name : '', email: user ? user.email : '', avatar: null },
        enableReinitialize: true,
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.set('name', values.name.trim());
            formData.set('email', values.email.trim());
            if (values.avatar) {
                formData.set('avatar', await readAsDataURL(values.avatar));
            }
            await updateProfile(formData)
        }
    })

    const onAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        formik.setFieldTouched('avatar', true, false)
        formik.setFieldValue('avatar', file)
        setAvatarPreview(await readAsDataURL(file))
    }

    if (!user) return <Loader />

    return (
        <>
            <MetaData title={'Update Profile'} />

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                <Paper component="form" noValidate onSubmit={formik.handleSubmit} sx={{ p: { xs: 3, md: 5 }, width: '100%', maxWidth: 480 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 1 }}>Update Profile</Typography>

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

                    <Button type="submit" variant="contained" size="large" fullWidth disabled={formik.isSubmitting} sx={{ py: 1.5, mt: 3 }}>
                        Update
                    </Button>
                </Paper>
            </Box>
        </>
    )
}

export default UpdateProfile
