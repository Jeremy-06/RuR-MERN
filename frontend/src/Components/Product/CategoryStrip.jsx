import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { clipCorners, darkTexture } from '../../theme'
import { categoryIcon } from '../Utils/categoryIcons'

const CategoryStrip = ({ categories, counts, selected, onToggle }) => {
    return (
        <Box
            component="nav"
            aria-label="Shop by category"
            sx={{
                mt: 2,
                p: 1,
                bgcolor: 'rur.panel',
                backgroundImage: darkTexture,
                gap: 0.75,
                display: { xs: 'flex', sm: 'grid' },
                overflowX: { xs: 'auto', sm: 'visible' },
                scrollSnapType: { xs: 'x proximity', sm: 'none' },
                scrollbarWidth: 'thin',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            }}
        >
            {categories.map(category => {
                const active = selected.includes(category)
                const count = counts ? counts[category] || 0 : undefined
                return (
                    <ButtonBase
                        key={category}
                        aria-pressed={active}
                        aria-label={count === undefined ? category : `${category}, ${count} ${count === 1 ? 'product' : 'products'}`}
                        onClick={() => onToggle(category)}
                        sx={{
                            flex: { xs: '0 0 104px', sm: 'initial' },
                            scrollSnapAlign: 'start',
                            flexDirection: 'column',
                            gap: 0.5,
                            py: 2,
                            px: 0.5,
                            color: '#fff',
                            bgcolor: active ? 'primary.dark' : 'rgba(255, 255, 255, 0.04)',
                            clipPath: clipCorners(8),
                            transition: 'background-color 180ms ease, transform 180ms ease',
                            '& svg': { fontSize: 30, color: active ? '#fff' : '#5c9dff', transition: 'color 180ms ease' },
                            '&:hover': { bgcolor: active ? 'primary.dark' : 'rgba(255, 255, 255, 0.12)' },
                            '@media (hover: hover) and (prefers-reduced-motion: no-preference)': { '&:hover': { transform: 'translateY(-2px)' } },
                            '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -4 },
                        }}
                    >
                        {categoryIcon(category)}
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{category}</Typography>
                        {count !== undefined && (
                            <Typography variant="caption" sx={{ color: active ? '#fff' : '#c9d0da', lineHeight: 1 }}>{count}</Typography>
                        )}
                    </ButtonBase>
                )
            })}
        </Box>
    )
}

export default CategoryStrip
