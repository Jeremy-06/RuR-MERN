import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Loader from '../Layout/Loader'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const { loading, isAuthenticated, user } = useSelector(state => state.auth)
    const location = useLocation()

    if (loading === false) {
        if (!isAuthenticated) {
            return <Navigate to={`/login?redirect=${location.pathname.substring(1)}`} />
        }
        if (isAdmin === true && user.role !== 'admin') {
            return <Navigate to='/' />
        }
        return children
    }
    return <Loader />;
};

export default ProtectedRoute;
