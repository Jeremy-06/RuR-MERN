import { useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { clipCorners } from '../../theme'

const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    bgcolor: 'rgba(9, 11, 15, 0.65)',
    color: '#fff',
    '&:hover': { bgcolor: 'primary.dark' },
}

const ProductGallery = ({ images = [], name }) => {
    const [active, setActive] = useState(0)
    const count = images.length

    return (
        <Stack spacing={1.5}>
            <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3', bgcolor: 'rur.panel', clipPath: clipCorners(18) }}>
                <Box
                    component="img"
                    src={count > 0 ? images[active].url : '/images/default_avatar.svg'}
                    alt={count > 1 ? `${name}, image ${active + 1} of ${count}` : name}
                    sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {count > 1 && (
                    <>
                        <IconButton aria-label="Previous image" onClick={() => setActive((active - 1 + count) % count)} sx={{ ...arrowStyle, left: 12 }}>
                            <ChevronLeftIcon />
                        </IconButton>
                        <IconButton aria-label="Next image" onClick={() => setActive((active + 1) % count)} sx={{ ...arrowStyle, right: 12 }}>
                            <ChevronRightIcon />
                        </IconButton>
                    </>
                )}
            </Box>

            {count > 1 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 1 }}>
                    {images.map((image, index) => (
                        <ButtonBase
                            key={image.public_id + image.url}
                            aria-label={`Show image ${index + 1} of ${count}`}
                            aria-current={index === active}
                            onClick={() => setActive(index)}
                            sx={{
                                aspectRatio: '1',
                                overflow: 'hidden',
                                border: 2,
                                borderColor: index === active ? 'primary.main' : 'divider',
                                transition: 'border-color 180ms ease',
                                '&:hover': { borderColor: 'primary.main' },
                            }}
                        >
                            <Box component="img" src={image.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </ButtonBase>
                    ))}
                </Box>
            )}
        </Stack>
    )
}

export default ProductGallery
