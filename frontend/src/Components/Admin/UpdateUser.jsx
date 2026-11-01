import { useEffect } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import EmptyState from '../Layout/EmptyState'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import { clearErrors, getUserDetails, updateUser } from '../../actions/userActions'
import { UPDATE_USER_RESET } from '../../constants/userConstants'
import { errMsg, formatDate, successMsg } from '../Utils/helpers'
import { accentTop } from '../../theme'

const ROLES = ['user', 'admin']

const updateUserSchema = Yup.object({
    name: Yup.string().trim().required('Please enter a name').max(30, 'Name cannot exceed 30 characters'),
    email: Yup.string().trim().required('Please enter an email').email('Please enter valid email address'),
    role: Yup.string().required('Please select a role').oneOf(ROLES, 'Please select a role'),
})

const UpdateUser = () => {
    const dispatch = useDispatch()
    const { user: me } = useSelector(state => state.auth)
    const { loading, error, user } = useSelector(state => state.userDetails)
    const { loading: saving, error: saveError, isUpdated } = useSelector(state => state.user)
    let navigate = useNavigate();
    const { id } = useParams();

    const isSelf = me._id === id

    useEffect(() => {
        dispatch(getUserDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (saveError) {
            errMsg(saveError)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('User updated successfully')
            dispatch({ type: UPDATE_USER_RESET })
            navigate('/admin/users')
        }
    }, [dispatch, saveError, isUpdated, navigate])

    const formik = useFormik({
        initialValues: { name: user ? user.name : '', email: user ? user.email : '', role: user ? user.role : 'user' },
        enableReinitialize: true,
        validationSchema: updateUserSchema,
        onSubmit: (values) => {
            dispatch(updateUser(id, updateUserSchema.cast(values)))
        }
    })

    const field = (name) => ({
        ...formik.getFieldProps(name),
        error: formik.touched[name] && Boolean(formik.errors[name]),
        helperText: formik.touched[name] && formik.errors[name],
    })

    let content
    if (error) {
        content = (
            <Box sx={{ mt: { xs: 3, md: 5 } }}>
                <EmptyState
                    icon={<ErrorOutlinedIcon />}
                    title="Could not load this user"
                    message={error}
                    action={<Button component={Link} to="/admin/users" variant="contained">Back to All Users</Button>}
                />
            </Box>
        )
    } else if (loading || !user) {
        content = <Loader fullPage />
    } else {
        content = (
            <>
                <PageHeader title="Update User" />
                <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <Card component="form" noValidate onSubmit={formik.handleSubmit} sx={{ ...accentTop, height: 'auto', p: { xs: 2.5, sm: 4 } }}>
                            <TextField id="name_field" label="Name" autoComplete="off" sx={{ mt: 0 }} {...field('name')} />
                            <TextField id="email_field" label="Email" type="email" autoComplete="off" {...field('email')} />
                            <TextField
                                id="role_field"
                                select
                                label="Role"
                                {...field('role')}
                                disabled={isSelf}
                                helperText={isSelf ? 'You cannot remove your own admin role.' : field('role').helperText}
                            >
                                {ROLES.map(role => <MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>{role}</MenuItem>)}
                            </TextField>
                            <Button type="submit" variant="contained" size="large" fullWidth disabled={saving} sx={{ mt: 2 }}>Update</Button>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Card sx={{ height: 'auto', p: { xs: 2.5, sm: 4 } }}>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                                <Avatar src={user.avatar ? user.avatar.url : undefined} alt="" sx={{ width: 72, height: 72 }} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h5" component="h2" sx={{ overflowWrap: 'anywhere' }}>{user.name}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ overflowWrap: 'anywhere' }}>{user.email}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                <Chip size="small" label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} sx={{ textTransform: 'capitalize' }} />
                                <Chip size="small" variant="outlined" label={user.authProvider === 'google' ? 'Google account' : 'Email account'} />
                            </Stack>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>Joined {formatDate(user.createdAt)}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ overflowWrap: 'anywhere' }}>ID {user._id}</Typography>
                        </Card>
                    </Grid>
                </Grid>
            </>
        )
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    {content}
                </Grid>
            </Grid>
        </>
    )
}

export default UpdateUser
