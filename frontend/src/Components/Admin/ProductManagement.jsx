import ArrowIcon from '../Utils/ArrowIcon'

export default function ProductManagement({
  products,
  productForm,
  editingId,
  onProductChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onRemove,
}) {
  return (
    <div className="admin-workspace">
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-form-heading">
          <div><span>{editingId ? 'EDIT ITEM' : 'NEW ITEM'}</span><h2>{editingId ? 'Update product' : 'Add a product'}</h2></div>
          {editingId && <button type="button" onClick={onCancelEdit}>Cancel</button>}
        </div>
        <label>PRODUCT NAME<input required maxLength={120} value={productForm.name} onChange={(event) => onProductChange('name', event.target.value)} /></label>
        <div className="admin-input-row">
          <label>CATEGORY<input required value={productForm.category} onChange={(event) => onProductChange('category', event.target.value)} /></label>
          <label>PRICE<input required type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => onProductChange('price', event.target.value)} /></label>
        </div>
        <div className="admin-input-row">
          <label>STOCK<input required type="number" min="0" step="1" value={productForm.stock} onChange={(event) => onProductChange('stock', event.target.value)} /></label>
          <label>IMAGE URL<input type="url" placeholder="https://..." value={productForm.image} onChange={(event) => onProductChange('image', event.target.value)} /></label>
        </div>
        <label>DESCRIPTION<textarea rows="3" value={productForm.description} onChange={(event) => onProductChange('description', event.target.value)} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={productForm.featured} onChange={(event) => onProductChange('featured', event.target.checked)} /> Feature this product</label>
        <button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Create product'} <ArrowIcon /></button>
      </form>

      <div className="admin-table-wrap">
        <div className="admin-table-title"><h2>Product catalog</h2><span>{products.length} items</span></div>
        <table className="admin-table">
          <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>ACTIONS</th></tr></thead>
          <tbody>{products.map((product) => (
            <tr key={product._id}>
              <td><div className="admin-product-name">{product.image && <img src={product.image} alt="" />}<span>{product.name}</span></div></td>
              <td>{product.category}</td><td>${Number(product.price).toFixed(2)}</td><td>{product.stock}</td>
              <td className="table-actions"><button onClick={() => onEdit(product)}>Edit</button><button className="danger-action" onClick={() => onRemove(product)}>Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
        {!products.length && <p className="admin-empty">No products yet. Add your first product using the form.</p>}
      </div>
    </div>
  )
}
