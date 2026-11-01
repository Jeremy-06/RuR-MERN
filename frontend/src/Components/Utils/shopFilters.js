export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'top_rated', label: 'Top rated' },
]
export const DEFAULT_SORT = 'newest'

export const isSort = (value) => SORT_OPTIONS.some(option => option.value === value)

const PRICE_STEPS = [25, 50, 100, 250, 500, 1000, 2500, 5000]
const MAX_PRICE_STEPS = 3

// Galing sa totoong range ng catalog. Cents ang max para hindi magsabay ang katabing presets.
export const pricePresets = (range) => {
    if (!range) return []

    const inside = PRICE_STEPS.filter(step => step > range.min && step < range.max)
    const steps = inside.length <= MAX_PRICE_STEPS
        ? inside
        : [0, 1, 2].map(index => inside[Math.round(index * (inside.length - 1) / (MAX_PRICE_STEPS - 1))])
    const below = (step) => (step - 0.01).toFixed(2)

    return steps.flatMap((step, index) => {
        const presets = []
        if (index === 0) presets.push({ label: `Under $${step}`, min: '', max: below(step) })
        presets.push(index === steps.length - 1
            ? { label: `$${step}+`, min: String(step), max: '' }
            : { label: `$${step}–$${steps[index + 1]}`, min: String(step), max: below(steps[index + 1]) })
        return presets
    })
}

export const priceLabel = (min, max, presets) => {
    const preset = presets.find(item => item.min === min && item.max === max)
    if (preset) return preset.label
    if (min && max) return `$${min}–$${max}`
    return min ? `From $${min}` : `Up to $${max}`
}

export const reviewsLabel = (minReviews) => Number(minReviews) === 1 ? 'Has reviews' : `${minReviews}+ reviews`
