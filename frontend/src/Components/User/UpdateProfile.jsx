import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MetaData from '../Layout/MetaData'
import AuthCard from './AuthCard'
import AvatarField from './AvatarField'
import { clearErrors, loadUser, updateProfile } from '../../actions/userActions'
import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { avatarSchema, errMsg, readAsDataURL, successMsg } from '../Utils/helpers'

const profileSchema = Yup.object({
    name: Yup.string().trim().required('Please enter your name').max(30, 'Your name cannot exceed 30 characters'),
    email: Yup.string().trim().required('Please enter your email').email('Please enter valid email address'),
    avatar: avatarSchema,
})

const UpdateProfile = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { loading, error, isUpdated } = useSelector(state => state.user)
    let navigate = useNavigate();

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('user updated')
            dispatch({ type: UPDATE_PROFILE_RESET })
            dispatch(loadUser())
            navigate('/me', { replace: true })
        }
    }, [dispatch, error, isUpdated, navigate])

    const formik = useFormik({
        initialValues: { name: user.name, email: user.email, avatar: null },
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.set('name', values.name.trim());
            formData.set('email', values.email.trim());
            if (values.avatar) {
                formData.set('avatar', await readAsDataURL(values.avatar));
            }
            await dispatch(updateProfile(formData))
        }
    })

    return (
        <>
            <MetaData title={'Update Profile'} />

            <AuthCard title="Update Profile" onSubmit={formik.handleSubmit}>
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

                <AvatarField formik={formik} current={user.avatar && user.avatar.url} />

                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || formik.isSubmitting} sx={{ mt: 3 }}>
                    Update
                </Button>
            </AuthCard>
        </>
    )
}

export default UpdateProfile
