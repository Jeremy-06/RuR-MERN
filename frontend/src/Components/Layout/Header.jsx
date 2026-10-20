import { useState } from 'react'
import '../../App.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

import Search from './Search'
export const Header = ({ cartItems }) => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth)
    const [anchorEl, setAnchorEl] = useState(null)
    let navigate = useNavigate()

    const goTo = (path) => {
        setAnchorEl(null)
        navigate(path)
    }

    const logoutHandler = () => {
        setAnchorEl(null)
        dispatch(logout());
        navigate('/')
        toast.success('log out', {
            position: 'bottom-right'
        });
    }

    return (
        <>
            <div className="announcement">
                LEVEL UP YOUR SETUP <span>/</span> FREE SHIPPING ON ORDERS OVER $200
            </div>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rur.black', borderBottom: '1px solid rgba(211, 220, 235, 0.12)' }}>
                <Toolbar sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2, py: 1.5 }}>
                    <Link to="/" className="brand-logo" aria-label="RuR home">
                        <span className="brand-mark">R<span>u</span>R</span>
                        <span className="brand-caption">READY. UP.<br />REPEAT.</span>
                    </Link>

                    <Box sx={{ flexGrow: 1, order: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' }, maxWidth: { md: 560 }, mx: { md: 'auto' } }}>
                        <Search />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                        {user ? (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    startIcon={<Avatar src={user.avatar && user.avatar.url} alt={user.name} sx={{ width: 32, height: 32 }} />}
                                    sx={{ textTransform: 'none', fontWeight: 500 }}
                                    aria-controls={anchorEl ? 'user-menu' : undefined}
                                    aria-haspopup="true"
                                >
                                    {user.name}
                                </Button>
                                <Menu
                                    id="user-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={() => setAnchorEl(null)}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    {user.role === 'admin' && (
                                        <MenuItem onClick={() => goTo('/dashboard')}>Dashboard</MenuItem>
                                    )}
                                    {user.role === 'admin' && (
                                        <MenuItem onClick={() => goTo('/admin/products')}>Products</MenuItem>
                                    )}
                                    <MenuItem onClick={() => goTo('/orders/me')}>Orders</MenuItem>
                                    <MenuItem onClick={() => goTo('/me')}>Profile</MenuItem>
                                    <Divider />
                                    <MenuItem onClick={logoutHandler} sx={{ color: 'secondary.main' }}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : !loading && (
                            <Button component={Link} to="/login" variant="contained" id="login_btn">Login</Button>
                        )}

                        <Button component={Link} to="/cart" color="inherit" sx={{ textTransform: 'none' }}>
                            <Badge badgeContent={cartItems ? cartItems.length : 0} color="primary" showZero>
                                <span id="cart">Cart</span>
                            </Badge>
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </>
    )
}
