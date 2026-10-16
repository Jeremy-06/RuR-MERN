export default function AdminStats({ products, users }) {
  const adminCount = users.filter((user) => user.role === 'admin').length

  return (
    <div className="admin-stats">
      <div><span>PRODUCTS</span><strong>{products.length}</strong></div>
      <div><span>USER ACCOUNTS</span><strong>{users.length}</strong></div>
      <div><span>ADMIN ACCOUNTS</span><strong>{adminCount}</strong></div>
    </div>
  )
}
