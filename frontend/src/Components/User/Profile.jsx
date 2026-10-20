import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import axios from 'axios';
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import { errMsg } from '../Utils/helpers'

const Profile = () => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})

    const getProfile = async () => {
        const config = {
            withCredentials: true
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
            setUser(data.user)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        getProfile()
    }, [])

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Your Profile'} />

                    <Typography variant="h3" component="h2" sx={{ mt: 5, mb: 3 }}>My Profile</Typography>
                    <Paper sx={{ p: { xs: 3, md: 5 } }}>
                        <Grid container spacing={5}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack alignItems="center" spacing={3}>
                                    <Avatar src={user.avatar ? user.avatar.url : null} alt={user.name} sx={{ width: 180, height: 180 }} />
                                    <Button component={Link} to="/me/update" id="edit_profile" variant="contained" fullWidth>
                                        Edit Profile
                                    </Button>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 8 }}>
                                <Stack spacing={2}>
                                    <div>
                                        <Typography variant="h5" component="h4">Full Name</Typography>
                                        <Typography>{user.name}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h5" component="h4">Email Address</Typography>
                                        <Typography>{user.email}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h5" component="h4">Joined On</Typography>
                                        <Typography>{String(user.createdAt).substring(0, 10)}</Typography>
                                    </div>
                                    <Stack direction="row" spacing={1}>
                                        <Chip label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} />
                                        <Chip label={user.authProvider === 'google' ? 'Google account' : 'Email account'} variant="outlined" />
                                    </Stack>

                                    {user.role !== 'admin' && (
                                        <Button component={Link} to="/orders/me" variant="contained" color="secondary">
                                            My Orders
                                        </Button>
                                    )}

                                    {user.authProvider !== 'google' && (
                                        <Button component={Link} to="/password/update" variant="outlined">
                                            Change Password
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </>
            )}
        </>
    )
}

export default Profile
