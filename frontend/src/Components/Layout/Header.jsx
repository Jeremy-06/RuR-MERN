import '../../App.css'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'

import Search from './Search'
export const Header = ({ cartItems }) => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth)

    const logoutHandler = () => {
        dispatch(logout());
        toast.success('log out', {
            position: 'bottom-right'
        });
    }

    return (
        <>
            <div className="announcement">
                LEVEL UP YOUR SETUP <span>/</span> FREE SHIPPING ON ORDERS OVER $200
            </div>
            <nav className="navbar row">
                <div className="col-12 col-md-3">
                    <div className="navbar-brand">
                        <Link to="/" className="brand-logo" aria-label="RuR home">
                            <span className="brand-mark">R<span>u</span>R</span>
                            <span className="brand-caption">READY. UP.<br />REPEAT.</span>
                        </Link>
                    </div>
                </div>

                <div className="col-12 col-md-5 mt-2 mt-md-0">
                    <Search />
                </div>

                <div className="col-12 col-md-4 mt-4 mt-md-0 text-center text-nowrap">
                    {user ? (<div className="ml-4 dropdown d-inline">
                        <Link to="#!" className="btn dropdown-toggle text-white mr-4" type="button" id="dropDownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <figure className="avatar avatar-nav">
                                <img
                                    src={user.avatar && user.avatar.url}
                                    alt={user && user.name}
                                    className="rounded-circle"
                                />
                            </figure>
                            <span>{user && user.name}</span>
                        </Link>

                        <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                            {user && user.role === 'admin' && (
                                <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                            )}
                            <Link className="dropdown-item" to="/orders/me">Orders</Link>
                            <Link className="dropdown-item" to="/me">Profile</Link>

                            <Link
                                className="dropdown-item text-danger" to="/"
                                onClick={logoutHandler}
                            >
                                Logout
                            </Link>
                        </div>
                    </div>) : !loading && <Link to="/login" className="btn ml-4" id="login_btn">Login</Link>}

                    <Link to="/cart" style={{ textDecoration: 'none' }} >
                        <span id="cart" className="ml-3">Cart</span>
                        <span className="ml-1" id="cart_count">{cartItems ? cartItems.length : null}</span>
                    </Link>
                </div>
            </nav>
        </>
    )
}
