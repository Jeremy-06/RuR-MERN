import { useEffect, useState } from 'react'
import AdminDashboard from './Components/Admin/AdminDashboard'
import Home from './Components/Home'
import AuthPage from './Components/User/AuthPage'
import { apiRequest } from './Components/Utils/api'
import './App.css'

function App() {
  const [view, setView] = useState('shop')
  const [authRole, setAuthRole] = useState('user')
  const [currentUser, setCurrentUser] = useState(null)
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    apiRequest('/api/auth/me')
      .then(({ user }) => {
        if (!user) return
        setCurrentUser(user)
        if (user.role === 'admin') setView('admin')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiRequest('/api/products')
      .then(({ products: catalog }) => setProducts(catalog))
      .catch(() => setProducts([]))
  }, [])

  async function logOut() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setCurrentUser(null)
    setView('shop')
  }

  function openLogin() {
    setAuthRole('user')
    setView('login')
  }

  if (view === 'login' || view === 'register') {
    return (
      <AuthPage
        mode={view}
        setMode={setView}
        role={authRole}
        setRole={setAuthRole}
        onBack={() => setView('shop')}
        onSuccess={(user) => {
          setCurrentUser(user)
          setView(user.role === 'admin' ? 'admin' : 'shop')
        }}
      />
    )
  }

  if (view === 'admin' && currentUser?.role === 'admin') {
    return <AdminDashboard user={currentUser} onShop={() => setView('shop')} onLogout={logOut} />
  }

  return (
    <Home
      products={products}
      query={query}
      onSearch={setQuery}
      user={currentUser}
      onLogin={openLogin}
      onLogout={logOut}
      onAdmin={() => setView('admin')}
      cartCount={cartCount}
      onAddToCart={() => setCartCount((count) => count + 1)}
    />
  )
}

export default App
