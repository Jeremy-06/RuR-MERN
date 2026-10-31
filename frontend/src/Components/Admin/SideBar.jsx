import { NavLink } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'

const links = [
    { to: '/dashboard', icon: <DashboardOutlinedIcon />, label: 'Dashboard' },
    { to: '/admin/sales', icon: <ShowChartIcon />, label: 'Sales' },
    { to: '/admin/products', icon: <SportsEsportsOutlinedIcon />, label: 'Products' },
    { to: '/admin/orders', icon: <ShoppingBasketOutlinedIcon />, label: 'Orders' },
    { to: '/admin/users', icon: <PeopleOutlinedIcon />, label: 'Users' },
    { to: '/admin/reviews', icon: <StarBorderOutlinedIcon />, label: 'Reviews' },
]

// Same width as the Bootstrap col-md-2 the admin pages sit in
const desktop = '@media (min-width: 768px)'

const Sidebar = () => {
    return (
        <Paper
            component="nav"
            aria-label="Admin"
            sx={{
                bgcolor: 'rur.panel',
                border: 0,
                boxShadow: 'none',
                color: '#fff',
                mt: { xs: 2, md: 3 },
                p: 1,
                [desktop]: { position: 'sticky', top: 96 },
            }}
        >
            <List disablePadding sx={{ display: 'grid', gap: 0.5, gridTemplateColumns: 'repeat(3, 1fr)', [desktop]: { gridTemplateColumns: '1fr' } }}>
                {links.map(link => (
                    <ListItemButton
                        key={link.to}
                        component={NavLink}
                        to={link.to}
                        sx={{
                            borderRadius: 1,
                            color: '#fff',
                            flexDirection: 'column',
                            gap: 0.5,
                            px: 1,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#fff' },
                            '&.active, &.active:hover': { bgcolor: 'primary.dark', color: '#fff' },
                            [desktop]: { flexDirection: 'row', gap: 1.5, px: 1.5 },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.label} slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }} sx={{ my: 0 }} />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    )
}

export default Sidebar
