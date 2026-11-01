import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import { formatDate } from '../Utils/helpers'
import { accentTop } from '../../theme'

const Detail = ({ label, children }) => (
    <Box>
        <Typography variant="overline" component="h2" color="textSecondary">{label}</Typography>
        <Typography sx={{ overflowWrap: 'anywhere' }}>{children}</Typography>
    </Box>
)

const Profile = () => {
    const { user } = useSelector(state => state.auth)

    return (
        <>
            <MetaData title={'Your Profile'} />
            <PageHeader title="My Profile" />

            <Card sx={{ ...accentTop, height: 'auto', p: { xs: 3, md: 5 } }}>
                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack sx={{ alignItems: 'center', gap: 3 }}>
                            <Avatar src={user.avatar ? user.avatar.url : undefined} alt={user.name} sx={{ width: 180, height: 180 }} />
                            <Button component={Link} to="/me/update" id="edit_profile" variant="contained" fullWidth>
                                Edit Profile
                            </Button>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack sx={{ gap: 2.5 }}>
                            <Detail label="Full Name">{user.name}</Detail>
                            <Detail label="Email Address">{user.email}</Detail>
                            <Detail label="Joined On">{formatDate(user.createdAt)}</Detail>

                            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                <Chip label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} sx={{ textTransform: 'capitalize' }} />
                                <Chip label={user.authProvider === 'google' ? 'Google account' : 'Email account'} variant="outlined" />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
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
                        </Stack>
                    </Grid>
                </Grid>
            </Card>
        </>
    )
}

export default Profile
