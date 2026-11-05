import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Alert from '@mui/material/Alert'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import Product from './Product/Product'
import ProductCardSkeleton from './Product/ProductCardSkeleton'
import CategoryStrip from './Product/CategoryStrip'
import HomeHero from './Product/HomeHero'
import ProductFilters from './Product/ProductFilters'
import ShopToolbar, { FilterChips } from './Product/ShopToolbar'
import EmptyState from './Layout/EmptyState'
import MetaData from './Layout/MetaData'
import SectionTitle from './Layout/SectionTitle'
import { DEFAULT_SORT, isSort, priceLabel, pricePresets, reviewsLabel } from './Utils/shopFilters'

import { useDispatch, useSelector } from 'react-redux'
import { getCategories, getProductFacets, getProducts, getTopRatedProducts, productsKey } from '../actions/productActions'
import { addItemToCart } from '../actions/cartActions'

const PAGE_SKELETONS = 12
const MORE_SKELETONS = 6
const HERO_PRODUCTS = 3

const scrollParent = (element) => {
    for (let node = element.parentElement; node && node !== document.documentElement; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)) return node
    }
    return null
}

const Home = () => {
    let { keyword } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { loading, products, error, page, hasMore, filteredProductsCount, productsCount, key } = useSelector(state => state.products);
    const { products: topRated } = useSelector(state => state.topRatedProducts)
    const { cartItems } = useSelector(state => state.cart)
    const { categories, error: categoriesError } = useSelector(state => state.categories)
    const facets = useSelector(state => state.productFacets)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const sentinelRef = useRef(null)

    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const categoryParam = searchParams.getAll('category').join(',')
    const minRating = searchParams.get('minRating') || ''
    const minReviews = searchParams.get('minReviews') || ''
    const sortParam = searchParams.get('sort') || ''
    const sort = isSort(sortParam) && sortParam !== DEFAULT_SORT ? sortParam : ''

    // Hiwalay ang sort para hindi mag-reload ng counts pag sort lang ang nagbago
    const shopFilters = useMemo(() => ({
        keyword: keyword || '',
        minPrice,
        maxPrice,
        categories: categoryParam ? categoryParam.split(',') : [],
        minRating,
        minReviews,
    }), [keyword, minPrice, maxPrice, categoryParam, minRating, minReviews])
    const filters = useMemo(() => ({ ...shopFilters, sort }), [shopFilters, sort])

    // Baka sa lumang filters pa ang products sa store
    const isCurrent = key === productsKey(filters)

    useEffect(() => {
        dispatch(getCategories())
        dispatch(getTopRatedProducts())
    }, [dispatch])

    useEffect(() => {
        dispatch(getProducts(filters, 1))
    }, [dispatch, filters])

    useEffect(() => {
        dispatch(getProductFacets(shopFilters))
    }, [dispatch, shopFilters])

    const loadMore = useCallback(() => {
        dispatch(getProducts(filters, page + 1))
    }, [dispatch, filters, page])

    const canLoadMore = isCurrent && page > 0 && hasMore && !loading && !error
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !canLoadMore) return

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore()
        }, { root: scrollParent(sentinel), rootMargin: '1200px 0px' })
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

    // Set quantity ang cart, kaya plus one sa kung ano na ang nandoon
    const quickAdd = (product) => {
        const inCart = cartItems.find(item => item.product === product._id)
        dispatch(addItemToCart(product._id, inCart ? Math.min(inCart.quantity + 1, product.stock) : 1))
    }

    // Hindi filter ang sort, kaya naiiwan
    const onClear = () => {
        setSearchParams(sort ? { sort } : {}, { replace: true })
    }

    const presets = useMemo(() => pricePresets(facets.priceRange), [facets.priceRange])

    const filterChips = [
        ...filters.categories.map(category => ({
            key: `category-${category}`,
            label: category,
            remove: () => onCategoryToggle(category),
        })),
        ...(minPrice || maxPrice ? [{
            key: 'price',
            label: priceLabel(minPrice, maxPrice, presets),
            remove: () => onPriceChange('', ''),
        }] : []),
        ...(minRating ? [{
            key: 'rating',
            label: `${minRating}★ & up`,
            remove: () => updateParams({ minRating: '' }),
        }] : []),
        ...(minReviews ? [{
            key: 'reviews',
            label: reviewsLabel(minReviews),
            remove: () => updateParams({ minReviews: '' }),
        }] : []),
    ]
    const activeFilterCount = filterChips.length

    const chips = keyword ? [{
        key: 'keyword',
        label: `Search: ${keyword}`,
        remove: () => navigate({ pathname: '/', search: searchParams.toString() }),
    }, ...filterChips] : filterChips

    const showProducts = isCurrent ? products : []
    const isEmpty = isCurrent && page > 0 && !loading && !error && products.length === 0
    const isEnd = isCurrent && page > 0 && !loading && !hasMore && products.length > 0
    const firstLoad = (!isCurrent && !error) || (loading && showProducts.length === 0)
    const count = isCurrent ? filteredProductsCount : undefined

    let skeletons = 0
    if (firstLoad) skeletons = PAGE_SKELETONS
    else if (loading || canLoadMore) skeletons = MORE_SKELETONS

    const heroProducts = useMemo(() => {
        const seen = new Set()
        return [...topRated, ...products].filter(product => {
            if (seen.has(product._id)) return false
            seen.add(product._id)
            return true
        }).slice(0, HERO_PRODUCTS)
    }, [topRated, products])

    const filterPanel = (
        <ProductFilters
            categories={categories}
            categoriesError={categoriesError}
            onRetryCategories={() => dispatch(getCategories())}
            facets={facets}
            onRetryFacets={() => dispatch(getProductFacets(shopFilters))}
            filters={filters}
            onChange={updateParams}
            onPriceChange={onPriceChange}
            onCategoryToggle={onCategoryToggle}
            onClear={onClear}
            onClose={isMobile ? () => setDrawerOpen(false) : undefined}
            activeCount={activeFilterCount}
            compact={isMobile}
        />
    )

    return (
        <>
            <MetaData title={'Gaming Setup Essentials'} />
            {!keyword && (
                <HomeHero products={heroProducts} productsCount={productsCount} categoriesCount={categories ? categories.length : 0} />
            )}

            {!keyword && categories && (
                <CategoryStrip categories={categories} counts={facets.key === null || facets.error ? null : facets.categories} selected={filters.categories} onToggle={onCategoryToggle} />
            )}

            {!keyword && activeFilterCount === 0 && topRated.length > 0 && (
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

            <Box sx={{ mt: 5, mb: 3 }}>
                <SectionTitle variant="h3" component="h1" id="products_heading">
                    {keyword ? `Results for "${keyword}"` : 'Latest Gear'}
                </SectionTitle>
            </Box>

            <Grid container spacing={3} id="products" sx={{ scrollMarginTop: { xs: 136, md: 96 } }}>
                {!isMobile && (
                    <Grid size={{ md: 4, lg: 3 }}>
                        {/* Sariling scroll para hindi ma-trigger ang infinite scroll sa dulo ng filters */}
                        <Paper sx={{
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

                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <ShopToolbar
                        shown={showProducts.length}
                        total={count}
                        chips={chips}
                        sort={sort}
                        onSortChange={(value) => updateParams({ sort: value === DEFAULT_SORT ? '' : value })}
                        onClear={onClear}
                        showClear={activeFilterCount > 0}
                        isMobile={isMobile}
                        activeCount={activeFilterCount}
                        onOpenFilters={() => setDrawerOpen(true)}
                    />

                    <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                        {showProducts.map(product => (
                            <Grid key={product._id} size={{ xs: 6, lg: 4 }}>
                                <Product product={product} onAddToCart={quickAdd} />
                            </Grid>
                        ))}
                        {Array.from({ length: skeletons }, (item, index) => (
                            <Grid key={index} size={{ xs: 6, lg: 4 }}>
                                <ProductCardSkeleton />
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ pt: 3, textAlign: 'center' }} aria-live="polite">
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
                            <EmptyState
                                icon={<SearchOffOutlinedIcon />}
                                title="No gear matches these filters"
                                message="Try a wider price range or fewer categories."
                                action={
                                    <>
                                        {chips.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.75, mb: 2 }}>
                                                <FilterChips chips={chips} />
                                            </Box>
                                        )}
                                        {activeFilterCount > 0
                                            ? <Button variant="contained" onClick={onClear}>Clear filters</Button>
                                            : <Button component={Link} to="/" variant="contained">Browse all gear</Button>}
                                    </>
                                }
                            />
                        )}

                        {isEnd && (
                            <Typography color="textSecondary">You've seen all {filteredProductsCount} products.</Typography>
                        )}
                    </Box>
                    <div ref={sentinelRef} aria-hidden="true" />
                </Grid>
            </Grid>

            {isMobile && (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    keepMounted
                    slotProps={{ paper: { sx: { width: 'min(360px, 92vw)', display: 'flex', flexDirection: 'column', border: 0 } } }}
                >
                    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                        {filterPanel}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Button variant="outlined" color="secondary" disabled={activeFilterCount === 0} onClick={onClear}>Clear</Button>
                        <Button variant="contained" sx={{ flexGrow: 1 }} onClick={() => setDrawerOpen(false)}>
                            {count === undefined ? 'Show results' : `Show ${count} ${count === 1 ? 'result' : 'results'}`}
                        </Button>
                    </Box>
                </Drawer>
            )}
        </>
    )
}

export default Home
