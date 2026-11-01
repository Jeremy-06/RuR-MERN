import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Alert from '@mui/material/Alert'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import Product from './Product/Product'
import CategoryStrip from './Product/CategoryStrip'
import ProductFilters from './Product/ProductFilters'
import Loader from './Layout/Loader'
import MetaData from './Layout/MetaData'
import SectionTitle from './Layout/SectionTitle'
import { clipCorners, darkTexture } from '../theme'

import { useDispatch, useSelector } from 'react-redux'
import { getCategories, getProducts, getTopRatedProducts, productsKey } from '../actions/productActions'
import { addItemToCart } from '../actions/cartActions'

const heroImage = 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1400&q=80'

const Home = () => {
    let { keyword } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch();
    const { loading, products, error, page, hasMore, filteredProductsCount, key } = useSelector(state => state.products);
    const { products: topRated } = useSelector(state => state.topRatedProducts)
    const { cartItems } = useSelector(state => state.cart)
    const { categories, error: categoriesError } = useSelector(state => state.categories)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const sentinelRef = useRef(null)

    // Active filters live in the URL: /?minPrice=10&maxPrice=200&category=Mice&category=Headsets&minRating=4
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const categoryParam = searchParams.getAll('category').join(',')
    const minRating = searchParams.get('minRating') || ''
    const filters = useMemo(() => ({
        keyword: keyword || '',
        minPrice,
        maxPrice,
        categories: categoryParam ? categoryParam.split(',') : [],
        minRating,
    }), [keyword, minPrice, maxPrice, categoryParam, minRating])

    // The store may still hold products for older filters
    const isCurrent = key === productsKey(filters)

    useEffect(() => {
        dispatch(getCategories())
        dispatch(getTopRatedProducts())
    }, [dispatch])

    // Any filter change starts again from page 1
    useEffect(() => {
        dispatch(getProducts(filters, 1))
    }, [dispatch, filters])

    const loadMore = useCallback(() => {
        dispatch(getProducts(filters, page + 1))
    }, [dispatch, filters, page])

    // Load the next page when the sentinel below the grid comes near the screen
    const canLoadMore = isCurrent && page > 0 && hasMore && !loading && !error
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !canLoadMore) return

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore()
        }, { rootMargin: '600px 0px' })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [canLoadMore, loadMore])

    const retry = () => {
        if (page > 0) {
            loadMore()
        } else {
            dispatch(getProducts(filters, 1))
        }
    }

    const updateParams = useCallback((changes) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            Object.entries(changes).forEach(([name, value]) => {
                next.delete(name)
                    ;[].concat(value).filter(item => item !== '').forEach(item => next.append(name, item))
            })
            return next
        }, { replace: true })
    }, [setSearchParams])

    const onPriceChange = useCallback((min, max) => {
        updateParams({ minPrice: min, maxPrice: max })
    }, [updateParams])

    const onCategoryToggle = (category) => {
        const selected = filters.categories
        updateParams({
            category: selected.includes(category)
                ? selected.filter(item => item !== category)
                : [...selected, category]
        })
    }

    // The cart stores a set quantity, so one more is added to what is already there
    const quickAdd = (product) => {
        const inCart = cartItems.find(item => item.product === product._id)
        dispatch(addItemToCart(product._id, inCart ? Math.min(inCart.quantity + 1, product.stock) : 1))
    }

    const onRatingChange = (rating) => {
        updateParams({ minRating: rating })
    }

    const onClear = () => {
        setSearchParams({}, { replace: true })
    }

    const showProducts = isCurrent ? products : []
    const isEmpty = isCurrent && page > 0 && !loading && !error && products.length === 0
    const isEnd = isCurrent && page > 0 && !loading && !hasMore && products.length > 0
    const activeFilterCount = (minPrice || maxPrice ? 1 : 0) + filters.categories.length + (minRating ? 1 : 0)

    const filterPanel = (
        <ProductFilters
            categories={categories}
            categoriesError={categoriesError}
            onRetryCategories={() => dispatch(getCategories())}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedCategories={filters.categories}
            onPriceChange={onPriceChange}
            onCategoryToggle={onCategoryToggle}
            minRating={minRating}
            onRatingChange={onRatingChange}
            onClear={onClear}
        />
    )

    return (
        <>
            <MetaData title={'Gaming Setup Essentials'} />
            {!keyword && (
                <Box
                    component="section"
                    aria-label="Welcome"
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        mt: 3,
                        px: { xs: 3, md: 6 },
                        py: { xs: 5, md: 8 },
                        color: '#fff',
                        bgcolor: 'rur.black',
                        backgroundImage: `linear-gradient(105deg, #090b0f 38%, rgba(9, 11, 15, 0.55)), ${darkTexture}, url(${heroImage})`,
                        backgroundSize: 'auto, auto, cover',
                        backgroundPosition: 'center',
                        clipPath: clipCorners(28),
                    }}
                >
                    <Typography variant="overline" component="p" sx={{ color: '#a8cbff' }}>Built for your next level</Typography>
                    <Typography variant="h1" component="p" sx={{ my: 1 }}>
                        Your game. Your <Box component="span" sx={{ color: 'primary.main' }}>ground.</Box>
                    </Typography>
                    <Typography sx={{ maxWidth: 480, color: '#c9d0da' }}>
                        Gear that keeps up with every clutch, every late night, every new high score.
                    </Typography>
                </Box>
            )}

            {!keyword && categories && (
                <CategoryStrip categories={categories} selected={filters.categories} onToggle={onCategoryToggle} />
            )}

            {!keyword && activeFilterCount === 0 && !minRating && topRated.length > 0 && (
                <Box component="section" aria-labelledby="top-rated-title" sx={{ mt: 5 }}>
                    <SectionTitle id="top-rated-title" variant="h3" sx={{ mb: 3 }}>Top Rated</SectionTitle>
                    <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                        {topRated.map(product => (
                            <Grid key={product._id} size={{ xs: 6, md: 3 }}>
                                <Product product={product} onAddToCart={quickAdd} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, mt: 5, mb: 3 }}>
                <SectionTitle variant="h3" component="h1" id="products_heading" sx={{ mr: 'auto' }}>
                    {keyword ? `Results for "${keyword}"` : 'Latest Gear'}
                </SectionTitle>
                {isCurrent && filteredProductsCount !== undefined && (
                    <Typography color="textSecondary" aria-live="polite">
                        Showing {showProducts.length} of {filteredProductsCount}
                    </Typography>
                )}
                {isMobile && (
                    <Button variant="outlined" onClick={() => setDrawerOpen(true)} startIcon={<TuneOutlinedIcon />}>
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                    </Button>
                )}
            </Box>

            <Grid container spacing={3} id="products">
                {!isMobile && (
                    <Grid size={{ md: 3 }}>
                        {/* Stays below the sticky header and scrolls on its own, so reaching the
                            last filters never scrolls the page and triggers infinite scroll */}
                        <Paper sx={{
                            p: 3,
                            position: 'sticky',
                            top: 96,
                            maxHeight: 'calc(100vh - 96px - 24px)',
                            overflowY: 'auto',
                            overscrollBehavior: 'contain',
                            scrollbarWidth: 'thin',
                        }}>
                            {filterPanel}
                        </Paper>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 9 }}>
                    <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                        {showProducts.map(product => (
                            <Grid key={product._id} size={{ xs: 6, lg: 4 }}>
                                <Product product={product} onAddToCart={quickAdd} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* List states below the grid */}
                    <Box sx={{ py: 5, textAlign: 'center' }} aria-live="polite">
                        {(loading || (!isCurrent && !error)) && <Loader label="Loading products" sx={{ py: 0 }} />}

                        {isCurrent && error && (
                            <Alert
                                severity="error"
                                sx={{ textAlign: 'left' }}
                                action={<Button color="inherit" size="small" onClick={retry}>Retry</Button>}
                            >
                                {error}
                            </Alert>
                        )}

                        {isEmpty && (
                            <Paper sx={{ p: 5 }}>
                                <Typography variant="h5" component="p">No gear matches these filters</Typography>
                                <Typography color="textSecondary" sx={{ mt: 1, mb: 3 }}>Try a wider price range or fewer categories.</Typography>
                                <Button variant="contained" onClick={onClear}>Clear filters</Button>
                            </Paper>
                        )}

                        {isEnd && (
                            <Typography color="textSecondary">You've seen all {filteredProductsCount} products.</Typography>
                        )}
                    </Box>
                    <div ref={sentinelRef} aria-hidden="true" />
                </Grid>
            </Grid>

            {isMobile && (
                <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} keepMounted>
                    <Box sx={{ width: 300, p: 3 }}>
                        {filterPanel}
                        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setDrawerOpen(false)}>
                            Show results
                        </Button>
                    </Box>
                </Drawer>
            )}
        </>
    )
}

export default Home
