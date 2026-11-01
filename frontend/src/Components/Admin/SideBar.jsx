import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import { accentGradient, darkTexture } from '../../theme'

const sections = [
    {
        label: 'Overview',
        links: [
            { to: '/dashboard', icon: <DashboardOutlinedIcon />, label: 'Dashboard' },
            { to: '/admin/sales', icon: <ShowChartIcon />, label: 'Sales' },
        ],
    },
    {
        label: 'Manage',
        links: [
            { to: '/admin/products', icon: <SportsEsportsOutlinedIcon />, label: 'Products' },
            { to: '/admin/orders', icon: <ShoppingBasketOutlinedIcon />, label: 'Orders' },
            { to: '/admin/users', icon: <PeopleOutlinedIcon />, label: 'Users' },
            { to: '/admin/reviews', icon: <StarBorderOutlinedIcon />, label: 'Reviews' },
        ],
    },
]

const Sidebar = () => {
    return (
        <Paper
            component="nav"
            aria-label="Admin"
            sx={{
                bgcolor: 'rur.panel',
                backgroundImage: darkTexture,
                border: 0,
                boxShadow: 'none',
                color: '#fff',
                mt: { xs: 2, md: 3 },
                p: 1,
                position: { md: 'sticky' },
                top: { md: 96 },
            }}
        >
            <List disablePadding sx={{ display: 'grid', gap: 0.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: '1fr' } }}>
                {sections.map(section => (
                    <Fragment key={section.label}>
                        <Typography
                            variant="overline"
                            component="li"
                            sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '1 / -1', px: 1.5, pt: 1, color: 'rur.muted', fontSize: '0.6875rem' }}
                        >
                            {section.label}
                        </Typography>
                        {section.links.map(link => (
                            <ListItemButton
                                key={link.to}
                                component={NavLink}
                                to={link.to}
                                sx={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: 1,
                                    color: '#fff',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: { xs: 0.5, md: 1.5 },
                                    px: { xs: 1, md: 1.5 },
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#fff' },
                                    '&.Mui-focusVisible': { bgcolor: 'rgba(255, 255, 255, 0.08)', outline: '2px solid #fff', outlineOffset: -2 },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                        width: { xs: '100%', md: 4 },
                                        height: { xs: 3, md: '100%' },
                                        background: accentGradient,
                                        opacity: 0,
                                        transition: 'opacity 180ms ease',
                                    },
                                    '&.active, &.active:hover': { bgcolor: 'rgba(15, 107, 224, 0.32)', color: '#fff' },
                                    '&.active::before': { opacity: 1 },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>{link.icon}</ListItemIcon>
                                <ListItemText primary={link.label} slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }} sx={{ my: 0 }} />
                            </ListItemButton>
                        ))}
                    </Fragment>
                ))}
            </List>
        </Paper>
    )
}

export default Sidebar
