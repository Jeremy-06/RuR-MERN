import { useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EmptyState from '../Layout/EmptyState'
import MetaData from '../Layout/MetaData';
import AuthCard from './AuthCard'
import PasswordField from './PasswordField'
import { clearErrors, updatePassword } from '../../actions/userActions'
import { UPDATE_PASSWORD_RESET } from '../../constants/userConstants'
import { confirmPasswordSchema, errMsg, passwordSchema, successMsg } from '../Utils/helpers'

const updatePasswordSchema = Yup.object({
    oldPassword: Yup.string().required('Please enter your old password'),
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
})

const UpdatePassword = () => {
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
            successMsg('password updated')
            dispatch({ type: UPDATE_PASSWORD_RESET })
            navigate('/me')
        }
    }, [dispatch, error, isUpdated, navigate])

    const formik = useFormik({
        initialValues: { oldPassword: '', password: '', confirmPassword: '' },
        validationSchema: updatePasswordSchema,
        onSubmit: (values) => {
            dispatch(updatePassword(values))
        }
    })

    return (
        <>
            <MetaData title={'Change Password'} />

            {user.authProvider === 'google' ? (
                <Box sx={{ mt: { xs: 3, md: 5 } }}>
                    <EmptyState
                        icon={<LockOutlinedIcon />}
                        title="No password to change"
                        message="This account uses Google sign-in."
                        action={<Button component={Link} to="/me" variant="contained">Back to My Profile</Button>}
                    />
                </Box>
            ) : (
                <AuthCard title="Update Password" onSubmit={formik.handleSubmit}>
                    <PasswordField formik={formik} name="oldPassword" id="old_password_field" label="Old password" autoComplete="current-password" />
                    <PasswordField formik={formik} name="password" id="new_password_field" label="New password" autoComplete="new-password" />
                    <PasswordField formik={formik} name="confirmPassword" id="confirm_password_field" label="Confirm password" autoComplete="new-password" />

                    <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
                        Update Password
                    </Button>
                </AuthCard>
            )}
        </>
    )
}

export default UpdatePassword
