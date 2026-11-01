import { useEffect, useMemo, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import { accentGradient, clipCorners, darkTexture } from '../../theme'
import { categoryIcon } from '../Utils/categoryIcons'
import { pricePresets, reviewsLabel } from '../Utils/shopFilters'

const PRICE_DEBOUNCE = 500
const TOP_CATEGORIES = 6
const RATING_OPTIONS = ['4', '3', '2', '1']
const REVIEW_OPTIONS = ['5', '10']

const priceError = (min, max) => {
    if ((min !== '' && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
        (max !== '' && (!Number.isFinite(Number(max)) || Number(max) < 0))) {
        return 'Prices must be 0 or more'
    }
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
        return 'Min price cannot be greater than max price'
    }
    return ''
}

const clampPrice = (value, low, high) => Math.min(Math.max(value, low), high)

const FilterSection = ({ id, title, icon, open, children }) => (
    <Accordion
        defaultExpanded={open}
        disableGutters
        square
        sx={{ border: 0, boxShadow: 'none', borderBottom: 1, borderColor: 'divider', '&::before': { display: 'none' }, '&:last-of-type': { borderBottom: 0 } }}
    >
        <AccordionSummary
            id={`${id}-header`}
            aria-controls={`${id}-content`}
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 2, minHeight: 52, '& .MuiAccordionSummary-content': { my: 1.25, alignItems: 'center', gap: 1 } }}
        >
            <Box aria-hidden="true" sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>
            <Typography variant="h6" component="span">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>{children}</AccordionDetails>
    </Accordion>
)

const rowStyles = (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minHeight: 40,
    px: 1,
    borderRadius: 1,
    borderLeft: 3,
    borderColor: active ? 'primary.main' : 'transparent',
    color: active ? 'primary.dark' : 'text.primary',
    bgcolor: active ? '#e6f0ff' : 'transparent',
    fontWeight: active ? 700 : 500,
    textAlign: 'left',
    transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease',
    '&:hover': { bgcolor: active ? '#d8e7ff' : 'action.hover' },
    '&.Mui-disabled': { color: 'text.secondary', opacity: 0.6 },
})

const Count = ({ value }) => value === undefined ? null : (
    <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 'auto', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
)

const ProductFilters = ({
    categories, categoriesError, onRetryCategories, facets, onRetryFacets, filters, onChange, onPriceChange, onCategoryToggle, onClear, onClose, activeCount, compact,
}) => {
    const { minPrice, maxPrice, categories: selectedCategories, minRating, minReviews } = filters

    // Papasok sa URL after a short pause
    const [price, setPrice] = useState({ min: minPrice, max: maxPrice })
    const [urlPrice, setUrlPrice] = useState({ min: minPrice, max: maxPrice })
    const [showAll, setShowAll] = useState(false)

    // Sundan ang URL pag nagbago sa labas (clear filters, back button)
    if (urlPrice.min !== minPrice || urlPrice.max !== maxPrice) {
        setUrlPrice({ min: minPrice, max: maxPrice })
        setPrice({ min: minPrice, max: maxPrice })
    }

    const error = priceError(price.min, price.max)

    useEffect(() => {
        if (error || (price.min === minPrice && price.max === maxPrice)) return

        const timer = setTimeout(() => onPriceChange(price.min, price.max), PRICE_DEBOUNCE)
        return () => clearTimeout(timer)
    }, [price, error, minPrice, maxPrice, onPriceChange])

    const range = facets.priceRange
    const presets = useMemo(() => pricePresets(range), [range])
    const low = range ? Math.floor(range.min) : 0
    const high = range ? Math.ceil(range.max) : 0

    const sliderValue = [
        price.min === '' || error ? low : clampPrice(Number(price.min), low, high),
        price.max === '' || error ? high : clampPrice(Number(price.max), low, high),
    ]

    const onSliderChange = (e, [min, max]) => {
        setPrice({
            min: min === low ? '' : String(min),
            // Pinaka-taas ng slider = walang max
            max: max === high ? '' : String(max),
        })
    }

    // Nasa taas ang pinakamaraming products; hindi nawawala ang piniling category
    const orderedCategories = useMemo(() => categories
        ? [...categories].sort((a, b) => (facets.categories[b] || 0) - (facets.categories[a] || 0))
        : [], [categories, facets.categories])
    const visibleCategories = showAll
        ? orderedCategories
        : orderedCategories.filter((category, index) => index < TOP_CATEGORIES || selectedCategories.includes(category))

    // Wala pang counts kung hindi pa dumadating ang facets
    const hasCounts = facets.key !== null && !facets.error
    const categoryCount = (category) => hasCounts ? facets.categories[category] || 0 : undefined
    const ratingCount = (rating) => hasCounts ? facets.ratings[rating] || 0 : undefined
    const reviewCount = (step) => hasCounts ? facets.reviews[step] || 0 : undefined

    const hasFilters = activeCount > 0 || price.min !== '' || price.max !== ''

    // Kasama ang prices na na-type pero di pa na-apply
    const clearHandler = () => {
        setPrice({ min: '', max: '' })
        onClear()
    }

    const presetHandler = (preset, active) => {
        if (active) onPriceChange('', '')
        else onPriceChange(preset.min, preset.max)
    }

    return (
        <Box component="aside" aria-label="Product filters">
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pl: 2,
                    pr: 1,
                    py: 1,
                    color: '#fff',
                    bgcolor: 'rur.black',
                    backgroundImage: darkTexture,
                    clipPath: clipCorners(10),
                    '&::after': { content: '""', position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: accentGradient },
                }}
            >
                <Typography variant="h5" component="h2">Filters</Typography>
                {activeCount > 0 && (
                    <Box
                        aria-label={`${activeCount} active`}
                        role="status"
                        sx={{ minWidth: 22, px: 0.5, textAlign: 'center', bgcolor: 'secondary.main', color: '#11151b', fontFamily: 'h6.fontFamily', fontWeight: 800, clipPath: clipCorners(4) }}
                    >
                        {activeCount}
                    </Box>
                )}
                <Button
                    color="inherit"
                    size="small"
                    disabled={!hasFilters}
                    onClick={clearHandler}
                    sx={{ ml: 'auto', '&.Mui-disabled': { color: 'rur.muted' }, '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -2 } }}
                >
                    Clear all
                </Button>
                {onClose && (
                    <IconButton color="inherit" size="small" aria-label="Close filters" onClick={onClose} sx={{ '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -2 } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {facets.error && (
                <Box sx={{ px: 2, pt: 1.5 }}>
                    <FormHelperText error>Could not load the filter counts.</FormHelperText>
                    <Button size="small" onClick={onRetryFacets} sx={{ ml: -0.75 }}>Retry</Button>
                </Box>
            )}

            <FilterSection id="filter-category" title="Category" icon={<CategoryOutlinedIcon fontSize="small" />} open>
                {categoriesError ? (
                    <Box>
                        <FormHelperText error>{categoriesError}</FormHelperText>
                        <Button size="small" onClick={onRetryCategories}>Retry</Button>
                    </Box>
                ) : categories === null ? (
                    [1, 2, 3, 4, 5, 6].map(item => <Skeleton key={item} height={40} />)
                ) : (
                    <>
                        <Box role="group" aria-label="Categories" sx={{ display: 'grid', gap: 0.25 }}>
                            {visibleCategories.map(category => {
                                const active = selectedCategories.includes(category)
                                const count = categoryCount(category)
                                return (
                                    <ButtonBase
                                        key={category}
                                        role="checkbox"
                                        aria-checked={active}
                                        aria-label={count === undefined ? category : `${category}, ${count} ${count === 1 ? 'product' : 'products'}`}
                                        disabled={count === 0 && !active}
                                        onClick={() => onCategoryToggle(category)}
                                        sx={rowStyles(active)}
                                    >
                                        <Box aria-hidden="true" sx={{ display: 'flex', color: active ? 'primary.main' : 'text.secondary', '& svg': { fontSize: 20 } }}>
                                            {active ? <CheckIcon /> : categoryIcon(category)}
                                        </Box>
                                        <Typography component="span" variant="body2" sx={{ fontWeight: 'inherit' }}>{category}</Typography>
                                        <Count value={count} />
                                    </ButtonBase>
                                )
                            })}
                        </Box>
                        {categories.length > TOP_CATEGORIES && (
                            <Button size="small" aria-expanded={showAll} onClick={() => setShowAll(!showAll)} sx={{ mt: 0.5, ml: -0.25, color: 'primary.dark' }}>
                                {showAll ? 'Show less' : `Show all (${categories.length})`}
                            </Button>
                        )}
                    </>
                )}
            </FilterSection>

            <FilterSection id="filter-price" title="Price" icon={<SellOutlinedIcon fontSize="small" />} open={!compact || minPrice !== '' || maxPrice !== ''}>
                {range && high > low && (
                    <Box sx={{ px: 1.25, pt: 0.5 }}>
                        <Slider
                            getAriaLabel={(index) => index === 0 ? 'Minimum price' : 'Maximum price'}
                            value={sliderValue}
                            onChange={onSliderChange}
                            min={low}
                            max={high}
                            step={1}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `$${value}`}
                            disableSwap
                            sx={{
                                height: 6,
                                '& .MuiSlider-track': { border: 0, background: accentGradient },
                                '& .MuiSlider-rail': { bgcolor: 'rur.muted' },
                                '& .MuiSlider-thumb': {
                                    width: 18,
                                    height: 18,
                                    borderRadius: 0.5,
                                    bgcolor: '#fff',
                                    border: 3,
                                    borderColor: 'primary.main',
                                    transition: 'box-shadow 180ms ease, left 180ms ease',
                                    '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgba(15, 107, 224, 0.2)' },
                                    '&.Mui-focusVisible': { outline: '2px solid #0f6be0', outlineOffset: 2 },
                                },
                                '& .MuiSlider-valueLabel': { bgcolor: 'rur.black', fontFamily: 'h6.fontFamily', fontWeight: 700, borderRadius: 0.5 },
                            }}
                        />
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                        label="Min"
                        type="number"
                        size="small"
                        margin="dense"
                        value={price.min}
                        onChange={(e) => setPrice({ ...price, min: e.target.value })}
                        error={Boolean(error)}
                        slotProps={{
                            htmlInput: { min: 0, step: 1, 'aria-label': 'Minimum price' },
                            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                        }}
                    />
                    <TextField
                        label="Max"
                        type="number"
                        size="small"
                        margin="dense"
                        value={price.max}
                        onChange={(e) => setPrice({ ...price, max: e.target.value })}
                        error={Boolean(error)}
                        slotProps={{
                            htmlInput: { min: 0, step: 1, 'aria-label': 'Maximum price' },
                            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                        }}
                    />
                </Box>
                {error && <FormHelperText error>{error}</FormHelperText>}
                {presets.length > 0 && (
                    <Box role="group" aria-label="Price presets" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                        {presets.map(preset => {
                            const active = preset.min === minPrice && preset.max === maxPrice
                            return (
                                <Chip
                                    key={preset.label}
                                    label={preset.label}
                                    size="small"
                                    color={active ? 'primary' : 'default'}
                                    variant={active ? 'filled' : 'outlined'}
                                    aria-pressed={active}
                                    onClick={() => presetHandler(preset, active)}
                                />
                            )
                        })}
                    </Box>
                )}
            </FilterSection>

            <FilterSection id="filter-rating" title="Customer rating" icon={<StarBorderOutlinedIcon fontSize="small" />} open={!compact || minRating !== ''}>
                <Box role="group" aria-label="Minimum customer rating" sx={{ display: 'grid', gap: 0.25 }}>
                    {RATING_OPTIONS.map(rating => {
                        const active = minRating === rating
                        const count = ratingCount(rating)
                        return (
                            <ButtonBase
                                key={rating}
                                aria-pressed={active}
                                aria-label={count === undefined ? `${rating} stars and up` : `${rating} stars and up, ${count} ${count === 1 ? 'product' : 'products'}`}
                                disabled={count === 0 && !active}
                                onClick={() => onChange({ minRating: active ? '' : rating })}
                                sx={rowStyles(active)}
                            >
                                <Rating value={Number(rating)} size="small" readOnly aria-hidden="true" />
                                <Typography component="span" variant="body2" sx={{ fontWeight: 'inherit' }}>{rating}★ &amp; up</Typography>
                                <Count value={count} />
                            </ButtonBase>
                        )
                    })}
                </Box>
            </FilterSection>

            <FilterSection id="filter-reviews" title="Reviews" icon={<ForumOutlinedIcon fontSize="small" />} open={!compact || minReviews !== ''}>
                <FormControlLabel
                    sx={{ width: '100%', m: 0, justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                    control={
                        <Switch
                            checked={minReviews !== ''}
                            onChange={(e) => onChange({ minReviews: e.target.checked ? '1' : '' })}
                        />
                    }
                    label={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>Has reviews</Typography>
                            <Count value={reviewCount('1')} />
                        </Box>
                    }
                />
                <Box role="group" aria-label="Minimum number of reviews" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                    {REVIEW_OPTIONS.map(step => {
                        const active = minReviews === step
                        const count = reviewCount(step)
                        return (
                            <Chip
                                key={step}
                                label={count === undefined ? reviewsLabel(step) : `${reviewsLabel(step)} (${count})`}
                                size="small"
                                color={active ? 'primary' : 'default'}
                                variant={active ? 'filled' : 'outlined'}
                                disabled={count === 0 && !active}
                                aria-pressed={active}
                                onClick={() => onChange({ minReviews: active ? '' : step })}
                            />
                        )
                    })}
                </Box>
            </FilterSection>
        </Box>
    )
}

export default ProductFilters
