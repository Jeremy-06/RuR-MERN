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
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'

import Search from './Search'
export const Header = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const [anchorEl, setAnchorEl] = useState(null)
    let navigate = useNavigate()

    const cartCount = cartItems.length

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
            <Box sx={{ bgcolor: 'primary.dark', color: '#fff', textAlign: 'center', fontSize: '0.75rem', letterSpacing: '0.1em', py: 0.5, px: 2 }}>
                LEVEL UP YOUR SETUP <Box component="span" sx={{ mx: 1, opacity: 0.7 }}>/</Box> FREE SHIPPING ON ORDERS OVER $200
            </Box>
            <AppBar position="sticky">
                <Container>
                    <Toolbar disableGutters sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, columnGap: 3, rowGap: 1, py: 1.5 }}>
                        <Link to="/" className="brand-logo" aria-label="RuR home">
                            <span className="brand-mark">R<span>u</span>R</span>
                            <span className="brand-caption">READY. UP.<br />REPEAT.</span>
                        </Link>

                        <Box sx={{ flexGrow: 1, order: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' }, maxWidth: { md: 560 }, mx: { md: 'auto' } }}>
                            <Search />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                            {user ? (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={(e) => setAnchorEl(e.currentTarget)}
                                        startIcon={<Avatar src={user.avatar && user.avatar.url} alt="" sx={{ width: 32, height: 32 }} />}
                                        sx={{ fontWeight: 500, minWidth: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: 0 } }}
                                        aria-label={`Account menu for ${user.name}`}
                                        aria-controls={anchorEl ? 'user-menu' : undefined}
                                        aria-haspopup="true"
                                    >
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.name}
                                        </Box>
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
                                        <MenuItem onClick={logoutHandler} sx={{ color: 'error.main' }}>Logout</MenuItem>
                                    </Menu>
                                </>
                            ) : !loading && (
                                <Button component={Link} to="/login" variant="contained">Login</Button>
                            )}

                            <IconButton component={Link} to="/cart" color="inherit" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
                                <Badge badgeContent={cartCount} color="primary" showZero>
                                    <ShoppingCartOutlinedIcon />
                                </Badge>
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    )
}
