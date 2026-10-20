import { NavLink } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

const links = [
    { to: '/dashboard', icon: 'fa-tachometer', label: 'Dashboard' },
    { to: '/admin/products', icon: 'fa-gamepad', label: 'Products' },
    { to: '/admin/orders', icon: 'fa-shopping-basket', label: 'Orders' },
    { to: '/admin/users', icon: 'fa-users', label: 'Users' },
    { to: '/admin/reviews', icon: 'fa-star', label: 'Reviews' },
]

const Sidebar = () => {
    return (
        <Paper
            component="nav"
            elevation={0}
            square
            sx={{ bgcolor: 'rur.black', color: '#fff', minHeight: { md: 'calc(100vh - 110px)' }, py: 2, borderRadius: { xs: 2, md: 0 } }}
        >
            <List>
                {links.map(link => (
                    <ListItemButton
                        key={link.to}
                        component={NavLink}
                        to={link.to}
                        sx={{
                            py: 1.5,
                            color: '#fff',
                            '&:hover': { bgcolor: 'rur.panel', color: '#fff' },
                            '&.active': { bgcolor: 'primary.main', color: '#fff' },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                            <i className={`fa ${link.icon}`}></i>
                        </ListItemIcon>
                        <ListItemText primary={link.label} />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    )
}

export default Sidebar
