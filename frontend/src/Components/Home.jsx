import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Product from './Product/Product'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Pagination from '@mui/material/Pagination';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import { categories, errMsg } from './Utils/helpers'

import { useDispatch, useSelector } from 'react-redux'
import { getProducts, clearErrors } from '../actions/productActions'

const Home = () => {
    const [price, setPrice] = useState([1, 1000]);
    const [category, setCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1)
    let { keyword } = useParams();
    const dispatch = useDispatch();
    const { loading, products, error, resPerPage, filteredProductsCount } = useSelector(state => state.products);

    let count = filteredProductsCount;

    const handleChange = (event, newValue) => {
        setPrice(newValue);
        setCurrentPage(1)
    };

    const chooseCategory = (newCategory) => {
        setCategory(newCategory === category ? '' : newCategory)
        setCurrentPage(1)
    }

    function valuetext(price) {
        return `$${price.toString()}`;
    }

    useEffect(() => {
        dispatch(getProducts(currentPage, keyword, price, category))
    }, [dispatch, currentPage, keyword, price, category]);

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [dispatch, error])

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
            <h1 id="products_heading">{keyword ? `Results for "${keyword}"` : 'Latest Gear'}</h1>
            <section id="products" className="mt-5">
                <div className="row">
                    <div className="col-12 col-md-3 mt-3 mb-5">
                        <h4 className="mb-5">Price</h4>
                        <Box sx={{ width: '85%', mx: 'auto' }}>
                            <Slider
                                getAriaLabel={() => 'Price Filter'}
                                value={price}
                                onChange={handleChange}
                                valueLabelDisplay="on"
                                getAriaValueText={valuetext}
                                valueLabelFormat={valuetext}
                                min={1}
                                max={1000}
                            />
                        </Box>
                        <div className="mt-5">
                            <h4 className="mb-3">
                                Categories
                            </h4>
                            <ul className="pl-0 category-list">
                                {categories.map(item => (
                                    <li
                                        key={item}
                                        className={item === category ? 'active' : ''}
                                        onClick={() => chooseCategory(item)}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-12 col-md-9">
                        {loading ? <Loader /> : (
                            <div className="row">
                                {products && products.length > 0 ? products.map(product => (
                                    <Product key={product._id} product={product} />
                                )) : (
                                    <p className="col-12 mt-5 text-center">No gear found. Try another search or filter.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {resPerPage < count && (
                    <div className="d-flex justify-content-center mt-5">
                        <Stack spacing={2}>
                            <Pagination
                                count={Math.ceil(count / resPerPage)}
                                page={currentPage}
                                onChange={(event, value) => setCurrentPage(value)}
                                color="primary"
                                variant="outlined"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                size="large"
                                sx={{
                                    backgroundColor: 'white',
                                }}
                            />
                        </Stack>
                    </div>
                )}
            </section>
        </>
    )
}

export default Home
