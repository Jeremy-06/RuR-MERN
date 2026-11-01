import { useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Button from '@mui/material/Button'
import MetaData from '../Layout/MetaData'
import AuthCard from './AuthCard'
import PasswordField from './PasswordField'
import { clearErrors, loadUser, resetPassword } from '../../actions/userActions'
import { NEW_PASSWORD_RESET } from '../../constants/userConstants'
import { confirmPasswordSchema, errMsg, passwordSchema, successMsg } from '../Utils/helpers'

const newPasswordSchema = Yup.object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
})

const NewPassword = () => {
    const dispatch = useDispatch()
    const { loading, error, success } = useSelector(state => state.forgotPassword)
    let navigate = useNavigate();
    let { token } = useParams();

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (success) {
            successMsg('password updated')
            dispatch({ type: NEW_PASSWORD_RESET })
            dispatch(loadUser())
            navigate('/')
        }
    }, [dispatch, error, success, navigate])

    const formik = useFormik({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema: newPasswordSchema,
        onSubmit: (values) => {
            dispatch(resetPassword(token, values))
        }
    })

    return (
        <>
            <MetaData title={'New Password Reset'} />

            <AuthCard brandPanel title="New Password" onSubmit={formik.handleSubmit}>
                <PasswordField formik={formik} name="password" id="password_field" label="Password" autoComplete="new-password" />
                <PasswordField formik={formik} name="confirmPassword" id="confirm_password_field" label="Confirm password" autoComplete="new-password" />

                <Button id="new_password_button" type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2 }}>
                    Set Password
                </Button>
            </AuthCard>
        </>
    )
}

export default NewPassword
