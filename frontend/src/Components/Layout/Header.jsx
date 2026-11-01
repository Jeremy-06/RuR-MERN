import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'

import { accentGradient, darkTexture } from '../../theme'
import { isShop } from '../Utils/helpers'
import Search from './Search'

export const Header = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const [anchorEl, setAnchorEl] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    let navigate = useNavigate()
    const { pathname } = useLocation()

    const cartCount = cartItems.length
    const cartUnits = cartItems.reduce((acc, item) => acc + Number(item.quantity), 0)

    // Dagdag lang ang may galaw; hindi pag bawas o bukas ng page
    const [seenUnits, setSeenUnits] = useState(cartUnits)
    const [cartBumps, setCartBumps] = useState(0)
    if (cartUnits !== seenUnits) {
        setSeenUnits(cartUnits)
        if (cartUnits > seenUnits) setCartBumps(cartBumps + 1)
    }

    const navItems = [
        { to: '/', label: 'Shop', icon: <StorefrontOutlinedIcon />, active: isShop(pathname) },
        ...(user ? [{ to: '/orders/me', label: 'Orders', icon: <ReceiptLongOutlinedIcon />, active: pathname === '/orders/me' }] : []),
        ...(user && user.role === 'admin' ? [{ to: '/dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon />, active: pathname === '/dashboard' || pathname.startsWith('/admin/') }] : []),
    ]
    const menuItems = [
        ...navItems,
        { to: '/cart', label: `Cart (${cartCount})`, icon: <ShoppingCartOutlinedIcon />, active: pathname === '/cart' },
        ...(user ? [{ to: '/me', label: 'Profile', icon: <PersonOutlinedIcon />, active: pathname === '/me' }] : []),
        ...(user && user.role === 'admin' ? [{ to: '/admin/products', label: 'Products', icon: <SportsEsportsOutlinedIcon />, active: pathname === '/admin/products' }] : []),
    ]

    const goTo = (path) => {
        setAnchorEl(null)
        setMenuOpen(false)
        navigate(path)
    }

    const logoutHandler = () => {
        setAnchorEl(null)
        setMenuOpen(false)
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
                    <Toolbar disableGutters sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, columnGap: { xs: 1, md: 2 }, rowGap: 1, py: 1.5 }}>
                        <Link to="/" className="brand-logo" aria-label="RuR home">
                            <span className="brand-mark">R<span>u</span>R</span>
                            <span className="brand-caption">READY. UP.<br />REPEAT.</span>
                        </Link>

                        <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                            {navItems.map(item => (
                                <Button
                                    key={item.to}
                                    component={NavLink}
                                    to={item.to}
                                    color="inherit"
                                    aria-current={item.active ? 'page' : undefined}
                                    sx={{
                                        position: 'relative',
                                        px: 1.25,
                                        color: item.active ? '#fff' : '#c9d0da',
                                        '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.08)' },
                                        '&.Mui-focusVisible': { outlineColor: '#fff' },
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 10,
                                            right: 10,
                                            bottom: 2,
                                            height: 2,
                                            background: accentGradient,
                                            transform: item.active ? 'scaleX(1)' : 'scaleX(0)',
                                            transformOrigin: 'left',
                                            transition: 'transform 180ms ease',
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ flexGrow: 1, order: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' }, maxWidth: { md: 480 }, mx: { md: 'auto' } }}>
                            <Search />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, ml: 'auto' }}>
                            {user ? (
                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Button
                                        color="inherit"
                                        onClick={(e) => setAnchorEl(e.currentTarget)}
                                        startIcon={<Avatar src={user.avatar && user.avatar.url} alt="" sx={{ width: 32, height: 32 }} />}
                                        sx={{ fontWeight: 500, minWidth: 0, '& .MuiButton-startIcon': { mr: 1, ml: 0 } }}
                                        aria-label={`Account menu for ${user.name}`}
                                        aria-controls={anchorEl ? 'user-menu' : undefined}
                                        aria-haspopup="true"
                                    >
                                        <Box component="span" sx={{ display: { md: 'none', lg: 'block' }, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                                </Box>
                            ) : !loading && (
                                <Button component={Link} to="/login" variant="contained">Login</Button>
                            )}

                            <IconButton component={Link} to="/cart" color="inherit" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
                                <Box
                                    key={cartBumps}
                                    data-cart-bumps={cartBumps}
                                    sx={{ display: 'flex', animation: cartBumps > 0 ? 'rur-pop 250ms ease' : 'none' }}
                                >
                                    <Badge badgeContent={cartCount} color="primary" showZero>
                                        <ShoppingCartOutlinedIcon />
                                    </Badge>
                                </Box>
                            </IconButton>

                            <IconButton color="inherit" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} sx={{ display: { md: 'none' } }}>
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                slotProps={{ paper: { sx: { width: 'min(320px, 86vw)', border: 0, color: '#fff', bgcolor: 'rur.black', backgroundImage: darkTexture } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'rur.panelBorder' }}>
                    <span className="brand-mark">R<span>u</span>R</span>
                    <IconButton color="inherit" aria-label="Close menu" onClick={() => setMenuOpen(false)}><CloseIcon /></IconButton>
                </Box>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                        <Avatar src={user.avatar && user.avatar.url} alt="" />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{user.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'rur.muted', overflowWrap: 'anywhere' }}>{user.email}</Typography>
                        </Box>
                    </Box>
                )}

                <List component="nav" aria-label="Mobile menu" sx={{ px: 1 }}>
                    {menuItems.map(item => (
                        <ListItemButton
                            key={item.to}
                            selected={item.active}
                            aria-current={item.active ? 'page' : undefined}
                            onClick={() => goTo(item.to)}
                            sx={{
                                borderRadius: 1,
                                borderLeft: 3,
                                borderColor: item.active ? 'primary.main' : 'transparent',
                                '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'rgba(15, 107, 224, 0.28)' },
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
                                '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -2 },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                    {user && (
                        <ListItemButton onClick={logoutHandler} sx={{ borderRadius: 1, mt: 1, color: '#ff8a98', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }, '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -2 } }}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutOutlinedIcon /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    )}
                </List>
            </Drawer>
        </>
    )
}
