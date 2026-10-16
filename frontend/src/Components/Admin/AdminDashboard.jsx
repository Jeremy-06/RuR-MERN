import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../Utils/api'
import AdminStats from './AdminStats'
import ProductManagement from './ProductManagement'
import UserManagement from './UserManagement'
import { EMPTY_PRODUCT, EMPTY_USER } from './adminConstants'

export default function AdminDashboard({ user, onLogout, onShop }) {
  const [section, setSection] = useState('products')
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [userForm, setUserForm] = useState(EMPTY_USER)
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [productResult, userResult] = await Promise.all([
        apiRequest('/api/products'),
        apiRequest('/api/admin/users'),
      ])
      setProducts(productResult.products)
      setUsers(userResult.users)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function updateProductForm(field, value) {
    setProductForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateUserForm(field, value) {
    setUserForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function submitProduct(event) {
    event.preventDefault()
    setError('')
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }
      await apiRequest(editingId ? `/api/products/${editingId}` : '/api/products', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      setNotice(editingId ? 'Product updated.' : 'Product created.')
      setProductForm(EMPTY_PRODUCT)
      setEditingId(null)
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return
    try {
      await apiRequest(`/api/products/${product._id}`, { method: 'DELETE' })
      setNotice('Product deleted.')
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function addUser(event) {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(userForm) })
      setUserForm(EMPTY_USER)
      setNotice('User created.')
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function changeUserRole(targetUser, role) {
    try {
      await apiRequest(`/api/admin/users/${targetUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      })
      setNotice(`${targetUser.name}'s role updated.`)
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function removeUser(targetUser) {
    if (!window.confirm(`Delete account for ${targetUser.name}?`)) return
    try {
      await apiRequest(`/api/admin/users/${targetUser.id}`, { method: 'DELETE' })
      setNotice('User deleted.')
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function editProduct(product) {
    setEditingId(product._id)
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      description: product.description || '',
      featured: Boolean(product.featured),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelProductEdit() {
    setEditingId(null)
    setProductForm(EMPTY_PRODUCT)
  }

  function clearMessage() {
    setError('')
    setNotice('')
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="brand" href="#home"><span className="brand-mark">R<span>u</span>R</span><span className="brand-caption">ADMIN CONSOLE</span></a>
        <div className="admin-header-right">
          <span>{user.name} <b>ADMIN</b></span>
          <button className="button button-outline" onClick={onShop}>Storefront</button>
          <button className="button button-primary" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <section className="admin-main">
        <div className="eyebrow"><span /> STORE OPERATIONS</div>
        <h1>ADMIN <span>CONSOLE.</span></h1>
        <p className="admin-subtitle">Manage the catalog and customer accounts connected to your RuR database.</p>
        <AdminStats products={products} users={users} />

        {(error || notice) && (
          <div className={error ? 'admin-notice error' : 'admin-notice'} role="status">
            {error || notice}
            <button onClick={clearMessage}>×</button>
          </div>
        )}

        <nav className="admin-tabs">
          <button className={section === 'products' ? 'selected' : ''} onClick={() => setSection('products')}>Products <span>{products.length}</span></button>
          <button className={section === 'users' ? 'selected' : ''} onClick={() => setSection('users')}>Users <span>{users.length}</span></button>
        </nav>

        {section === 'products' ? (
          <ProductManagement
            products={products}
            productForm={productForm}
            editingId={editingId}
            onProductChange={updateProductForm}
            onSubmit={submitProduct}
            onCancelEdit={cancelProductEdit}
            onEdit={editProduct}
            onRemove={removeProduct}
          />
        ) : (
          <UserManagement
            users={users}
            user={user}
            userForm={userForm}
            onUserChange={updateUserForm}
            onSubmit={addUser}
            onRoleChange={changeUserRole}
            onRemove={removeUser}
          />
        )}
      </section>
    </main>
  )
}
