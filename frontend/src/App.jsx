import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useDispatch } from 'react-redux'
import { loadUser } from './actions/userActions'

import { Header } from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'

import './App.css'
import Home from './Components/Home'
import ProductDetails from './Components/Product/ProductDetails';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';

import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProductReviews from './Components/Admin/ProductReviews';
import ProtectedRoute from './Components/Route/ProtectedRoute';

function App() {
  const dispatch = useDispatch()

  const [state, setState] = useState({
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],

    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
  })

  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  }, [state.cartItems])

  const addItemToCart = async (id, quantity) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)

      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0] ? data.product.images[0].url : '',
        stock: data.product.stock,
        quantity: quantity
      }

      setState(prevState => {
        const isItemExist = prevState.cartItems.find(i => i.product === item.product)
        return {
          ...prevState,
          cartItems: isItemExist
            ? prevState.cartItems.map(i => i.product === isItemExist.product ? item : i)
            : [...prevState.cartItems, item]
        }
      })

      toast.success('Item Added to Cart', {
        position: 'bottom-right'
      })

    } catch (error) {
      toast.error(error.response ? error.response.data.message : error.message, {
        position: 'top-left'
      });
    }
  }

  const removeItemFromCart = async (id) => {
    setState(prevState => ({
      ...prevState,
      cartItems: prevState.cartItems.filter(i => i.product !== id)
    }))
  }

  const saveShippingInfo = async (data) => {
    setState(prevState => ({
      ...prevState,
      shippingInfo: data
    }))
    localStorage.setItem('shippingInfo', JSON.stringify(data))
  }

  const clearCart = () => {
    setState(prevState => ({
      ...prevState,
      cartItems: []
    }))
  }

  return (
    <>
      <Router>
        <Header cartItems={state.cartItems} />
        <div className="container container-fluid">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:keyword" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<NewPassword />} />
            <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/me/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
            <Route path="/password/update" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

            <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} />
            <Route path="/shipping" element={<ProtectedRoute><Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} /></ProtectedRoute>} />
            <Route path="/confirm" element={<ProtectedRoute><ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><OrderSuccess clearCart={clearCart} /></ProtectedRoute>} />
            <Route path="/orders/me" element={<ProtectedRoute><ListOrders /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute isAdmin={true}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute isAdmin={true}><ProductsList /></ProtectedRoute>} />
            <Route path="/admin/product" element={<ProtectedRoute isAdmin={true}><NewProduct /></ProtectedRoute>} />
            <Route path="/admin/product/:id" element={<ProtectedRoute isAdmin={true}><UpdateProduct /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute isAdmin={true}><OrdersList /></ProtectedRoute>} />
            <Route path="/admin/order/:id" element={<ProtectedRoute isAdmin={true}><ProcessOrder /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute isAdmin={true}><UsersList /></ProtectedRoute>} />
            <Route path="/admin/user/:id" element={<ProtectedRoute isAdmin={true}><UpdateUser /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute isAdmin={true}><ProductReviews /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
      <Footer />
      <ToastContainer />
    </>
  )
}

export default App
