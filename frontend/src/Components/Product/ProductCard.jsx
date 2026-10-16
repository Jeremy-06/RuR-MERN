export default function ProductCard({ product, onAddToCart }) {
  const image = product.image || ''
  const imageUrl = image.startsWith('http')
    ? image
    : image ? `https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=85` : ''

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {imageUrl && <img src={imageUrl} alt={product.name} loading="lazy" />}
        {product.featured && <span className="product-badge">FEATURED</span>}
        <button className="quick-add" onClick={() => onAddToCart(product)} aria-label={`Add ${product.name} to cart`}>+</button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="stock-label">{product.stock > 0 ? 'IN STOCK' : 'SOLD OUT'}</span>
        </div>
        <h3>{product.name}</h3>
        <div className="product-price"><strong>${Number(product.price).toFixed(2)}</strong></div>
      </div>
    </article>
  )
}
