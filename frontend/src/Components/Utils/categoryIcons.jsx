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

export const categoryIcon = (category) => icons[category] || <CategoryOutlinedIcon />
