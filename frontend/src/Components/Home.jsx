import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Product from './Product/Product'
import ProductFilters from './Product/ProductFilters'
import MetaData from './Layout/MetaData'

import { useDispatch, useSelector } from 'react-redux'
import { getProducts, productsKey } from '../actions/productActions'

const Home = () => {
    let { keyword } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch();
    const { loading, products, error, page, hasMore, filteredProductsCount, key } = useSelector(state => state.products);
    const [categories, setCategories] = useState(null)
    const [categoriesError, setCategoriesError] = useState('')
    const [categoriesAttempt, setCategoriesAttempt] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const sentinelRef = useRef(null)

    // Active filters live in the URL: /?minPrice=10&maxPrice=200&category=Mice&category=Headsets
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const categoryParam = searchParams.getAll('category').join(',')
    const filters = useMemo(() => ({
        keyword: keyword || '',
        minPrice,
        maxPrice,
        categories: categoryParam ? categoryParam.split(',') : [],
    }), [keyword, minPrice, maxPrice, categoryParam])

    // The store may still hold products for older filters
    const isCurrent = key === productsKey(filters)

    useEffect(() => {
        let ignore = false
        axios.get(`${import.meta.env.VITE_API}/categories`)
            .then(({ data }) => { if (!ignore) setCategories(data.categories) })
            .catch(error => { if (!ignore) setCategoriesError(error.response ? error.response.data.message : 'Could not load categories') })
        return () => { ignore = true }
    }, [categoriesAttempt])

    const retryCategories = () => {
        setCategories(null)
        setCategoriesError('')
        setCategoriesAttempt(attempt => attempt + 1)
    }

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

    const onClear = () => {
        setSearchParams({}, { replace: true })
    }

    const showProducts = isCurrent ? products : []
    const isEmpty = isCurrent && page > 0 && !loading && !error && products.length === 0
    const isEnd = isCurrent && page > 0 && !loading && !hasMore && products.length > 0
    const activeFilterCount = (minPrice || maxPrice ? 1 : 0) + filters.categories.length

    const filterPanel = (
        <ProductFilters
            categories={categories}
            categoriesError={categoriesError}
            onRetryCategories={retryCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedCategories={filters.categories}
            onPriceChange={onPriceChange}
            onCategoryToggle={onCategoryToggle}
            onClear={onClear}
        />
    )

    return (
        <>
            <MetaData title={'Gaming Setup Essentials'} />
            {!keyword && (
                <section className="hero-banner">
                    <span className="hero-eyebrow">BUILT FOR YOUR NEXT LEVEL</span>
                    <h1>YOUR GAME. YOUR <span>GROUND.</span></h1>
                    <p>Gear that keeps up with every clutch, every late night, every new high score.</p>
                </section>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 2, mt: 5, mb: 3 }}>
                <Typography variant="h3" component="h1" id="products_heading" sx={{ mr: 'auto' }}>
                    {keyword ? `Results for "${keyword}"` : 'Latest Gear'}
                </Typography>
                {isCurrent && filteredProductsCount !== undefined && (
                    <Typography color="text.secondary" aria-live="polite">
                        Showing {showProducts.length} of {filteredProductsCount}
                    </Typography>
                )}
                {isMobile && (
                    <Button variant="outlined" onClick={() => setDrawerOpen(true)} startIcon={<i className="fa fa-sliders"></i>}>
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                    </Button>
                )}
            </Box>

            <Grid container spacing={3} id="products">
                {!isMobile && (
                    <Grid size={{ md: 3 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 96 }}>
                            {filterPanel}
                        </Paper>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 9 }}>
                    <Grid container spacing={3}>
                        {showProducts.map(product => (
                            <Grid key={product._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                                <Product product={product} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* List states below the grid */}
                    <Box sx={{ py: 5, textAlign: 'center' }} aria-live="polite">
                        {(loading || (!isCurrent && !error)) && <CircularProgress aria-label="Loading products" />}

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
                                <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Try a wider price range or fewer categories.</Typography>
                                <Button variant="contained" onClick={onClear}>Clear filters</Button>
                            </Paper>
                        )}

                        {isEnd && (
                            <Typography color="text.secondary">You've seen all {filteredProductsCount} products.</Typography>
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
