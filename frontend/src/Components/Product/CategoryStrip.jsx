import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import CableOutlinedIcon from '@mui/icons-material/CableOutlined'
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CropLandscapeOutlinedIcon from '@mui/icons-material/CropLandscapeOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import HeadsetOutlinedIcon from '@mui/icons-material/HeadsetOutlined'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined'
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined'
import SpeakerOutlinedIcon from '@mui/icons-material/SpeakerOutlined'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { clipCorners, darkTexture } from '../../theme'

const icons = {
    Keyboards: <KeyboardOutlinedIcon />,
    Mice: <MouseOutlinedIcon />,
    Headsets: <HeadsetOutlinedIcon />,
    Speakers: <SpeakerOutlinedIcon />,
    Monitors: <MonitorOutlinedIcon />,
    Controllers: <SportsEsportsOutlinedIcon />,
    Chairs: <ChairOutlinedIcon />,
    Desks: <DeskOutlinedIcon />,
    Mousepads: <CropLandscapeOutlinedIcon />,
    Microphones: <MicNoneOutlinedIcon />,
    Webcams: <VideocamOutlinedIcon />,
    Lighting: <LightbulbOutlinedIcon />,
    Components: <MemoryOutlinedIcon />,
    Accessories: <CableOutlinedIcon />,
}

const CategoryStrip = ({ categories, selected, onToggle }) => {
    return (
        <Box
            component="nav"
            aria-label="Shop by category"
            sx={{
                mt: 2,
                p: 1,
                bgcolor: 'rur.panel',
                backgroundImage: darkTexture,
                display: 'grid',
                gap: 0.5,
                gridTemplateColumns: { xs: 'repeat(4, minmax(0, 1fr))', sm: 'repeat(7, minmax(0, 1fr))', lg: 'repeat(14, minmax(0, 1fr))' },
            }}
        >
            {categories.map(category => {
                const active = selected.includes(category)
                return (
                    <ButtonBase
                        key={category}
                        aria-pressed={active}
                        onClick={() => onToggle(category)}
                        sx={{
                            flexDirection: 'column',
                            gap: 0.5,
                            py: 1.25,
                            px: 0.25,
                            color: '#fff',
                            bgcolor: active ? 'primary.dark' : 'transparent',
                            clipPath: clipCorners(6),
                            transition: 'background-color 180ms ease',
                            '&:hover': { bgcolor: active ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)' },
                            '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -4 },
                        }}
                    >
                        {icons[category] || <CategoryOutlinedIcon />}
                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6875rem' }}>{category}</Typography>
                    </ButtonBase>
                )
            })}
        </Box>
    )
}

export default CategoryStrip
