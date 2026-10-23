import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import FormHelperText from '@mui/material/FormHelperText'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Rating from '@mui/material/Rating'

export const PRICE_MAX = 1000
const PRICE_DEBOUNCE = 500
const RATING_OPTIONS = ['4', '3', '2', '1']

// Returns an error message for the typed prices, or ''
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

const ProductFilters = ({ categories, categoriesError, onRetryCategories, minPrice, maxPrice, selectedCategories, onPriceChange, onCategoryToggle, minRating, onRatingChange, onClear }) => {
    // Typed values; they reach the URL after a short pause
    const [price, setPrice] = useState({ min: minPrice, max: maxPrice })
    const [urlPrice, setUrlPrice] = useState({ min: minPrice, max: maxPrice })

    // Follow the URL when it changes from outside (clear filters, back button)
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

    const sliderValue = [
        price.min === '' || error ? 0 : Math.min(Number(price.min), PRICE_MAX),
        price.max === '' || error ? PRICE_MAX : Math.min(Number(price.max), PRICE_MAX),
    ]

    const onSliderChange = (e, [min, max]) => {
        setPrice({
            min: min === 0 ? '' : String(min),
            // The top of the slider means "no max"
            max: max === PRICE_MAX ? '' : String(max),
        })
    }

    const hasFilters = minPrice !== '' || maxPrice !== '' || price.min !== '' || price.max !== '' || selectedCategories.length > 0 || minRating !== ''

    // Also drops prices that were typed but not applied yet
    const clearHandler = () => {
        setPrice({ min: '', max: '' })
        onClear()
    }

    return (
        <Box component="aside" aria-label="Product filters">
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Filters</Typography>

            <Typography variant="h5" component="h3">Price</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                    label="Min"
                    type="number"
                    size="small"
                    value={price.min}
                    onChange={(e) => setPrice({ ...price, min: e.target.value })}
                    error={Boolean(error)}
                    slotProps={{ htmlInput: { min: 0, step: 1, 'aria-label': 'Minimum price' } }}
                />
                <TextField
                    label="Max"
                    type="number"
                    size="small"
                    value={price.max}
                    onChange={(e) => setPrice({ ...price, max: e.target.value })}
                    error={Boolean(error)}
                    slotProps={{ htmlInput: { min: 0, step: 1, 'aria-label': 'Maximum price' } }}
                />
            </Box>
            {error && <FormHelperText error>{error}</FormHelperText>}
            <Box sx={{ px: 1, mt: 1 }}>
                <Slider
                    getAriaLabel={() => 'Price range'}
                    value={sliderValue}
                    onChange={onSliderChange}
                    min={0}
                    max={PRICE_MAX}
                    step={10}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value === PRICE_MAX ? `$${PRICE_MAX}+` : `$${value}`}
                    disableSwap
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h5" component="h3">Category</Typography>
            <FormGroup>
                {categoriesError ? (
                    <Box>
                        <FormHelperText error>{categoriesError}</FormHelperText>
                        <Button size="small" onClick={onRetryCategories}>Retry</Button>
                    </Box>
                ) : categories === null ? (
                    [1, 2, 3, 4, 5].map(item => <Skeleton key={item} height={36} />)
                ) : categories.map(category => (
                    <FormControlLabel
                        key={category}
                        label={category}
                        control={
                            <Checkbox
                                size="small"
                                checked={selectedCategories.includes(category)}
                                onChange={() => onCategoryToggle(category)}
                            />
                        }
                    />
                ))}
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h5" component="h3" id="rating-filter-label">Customer rating</Typography>
            <RadioGroup aria-labelledby="rating-filter-label" value={minRating} onChange={(e) => onRatingChange(e.target.value)}>
                <FormControlLabel value="" control={<Radio size="small" />} label="Any rating" />
                {RATING_OPTIONS.map(rating => (
                    <FormControlLabel
                        key={rating}
                        value={rating}
                        control={<Radio size="small" />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Rating value={Number(rating)} size="small" readOnly aria-hidden="true" />
                                <span>{`${rating} & up`}</span>
                            </Box>
                        }
                    />
                ))}
            </RadioGroup>

            <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }} disabled={!hasFilters} onClick={clearHandler}>
                Clear filters
            </Button>
        </Box>
    )
}

export default ProductFilters
