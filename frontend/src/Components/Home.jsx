import { useMemo, useState } from 'react'
import Header from './Layout/Header'
import Footer from './Layout/Footer'
import ProductCard from './Product/ProductCard'
import ArrowIcon from './Utils/ArrowIcon'

const categories = [
  { name: 'Keyboards', icon: '⌨', count: 'Keyboards' },
  { name: 'Mice', icon: '◉', count: 'Mice' },
  { name: 'Audio', icon: '♫', count: 'Audio' },
  { name: 'Desk setup', icon: '▤', count: 'Desk essentials' },
  { name: 'Accessories', icon: '✳', count: 'Accessories' },
]

export default function Home({ products, query, onSearch, user, onLogin, onLogout, onAdmin, cartCount, onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('All gear')
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === 'All gear' || product.category === activeCategory
    const matchesQuery = product.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  }), [activeCategory, products, query])

  function chooseCategory(category) {
    setActiveCategory(category)
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      <Header
        query={query}
        onSearch={onSearch}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        onAdmin={onAdmin}
        cartCount={cartCount}
      />
      <main id="home">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span /> BUILT FOR YOUR NEXT LEVEL</div>
            <h1>YOUR GAME.<br />YOUR <span>GROUND.</span></h1>
            <p>Gear that keeps up with every clutch, every late night, every new high score. Build a setup that feels like yours.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#featured">Shop the gear <ArrowIcon /></a>
              <a className="text-link" href="#categories">Explore categories <span>↘</span></a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><i>J</i><i>M</i><i>K</i><i>+</i></div>
              <span><strong>2,400+</strong> gamers upgraded</span>
              <span className="proof-stars">★★★★★</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-grid" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-scanline" />
            <div className="hero-product">
              <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1100&q=90" alt="Mechanical gaming keyboard with RGB lighting" />
              <div className="product-glow" />
            </div>
            <div className="hero-label label-top"><span>01 / INPUT</span><b>PRECISION<br />ENGINEERED</b></div>
            <div className="hero-label label-bottom"><span>RUR SYSTEMS</span><b>PLAY WITHOUT<br />COMPROMISE <i>↗</i></b></div>
            <div className="hero-crosshair">+</div>
            <div className="hero-index">FIG. 001 <span>GAMING ESSENTIALS</span></div>
          </div>
          <div className="hero-side-note">DESIGNED FOR THE GRIND <span>— 2026 COLLECTION</span></div>
        </section>

        <div className="ticker"><div>GEAR UP <span>✳</span> LOCK IN <span>✳</span> LEVEL UP <span>✳</span> REPEAT <span>✳</span> GEAR UP <span>✳</span> LOCK IN <span>✳</span> LEVEL UP <span>✳</span> REPEAT <span>✳</span></div></div>

        <section className="category-section section-wrap" id="categories">
          <div className="section-heading">
            <div><div className="eyebrow"><span /> FIND YOUR LOADOUT</div><h2>SHOP BY <span>GEAR.</span></h2></div>
            <a href="#featured" className="text-link">View all categories <ArrowIcon /></a>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <button className="category-card" key={category.name} onClick={() => chooseCategory(category.name)}>
                <span className="category-number">0{index + 1}</span>
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}<ArrowIcon /></span>
                <span className="category-count">{category.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="featured-section section-wrap" id="featured">
          <div className="section-heading">
            <div><div className="eyebrow"><span /> THE COMMUNITY'S PICKS</div><h2>LOADOUT <span>FAVORITES.</span></h2></div>
            <div className="product-filter">
              {['All gear', 'Keyboards', 'Mice', 'Audio'].map((category) => (
                <button key={category} className={activeCategory === category ? 'filter-active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {visibleProducts.length
              ? visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />)
              : <div className="empty-state">No products are available yet. Check back soon.</div>}
          </div>
          <div className="catalog-cta"><span>GOOD GEAR. NO GUESSWORK.</span><a className="button button-outline" href="#categories">Explore the full catalog <ArrowIcon /></a></div>
        </section>

        <section className="story-band" id="story">
          <div className="story-mark">R<span>u</span>R</div>
          <div><div className="eyebrow"><span /> BUILT BY GAMERS, FOR GAMERS</div><h2>IT'S NOT JUST A SETUP.<br /><span>IT'S YOUR SPACE.</span></h2></div>
          <p>We find the gear that earns its place on your desk. Thoughtful picks, no filler, and everything you need to make your corner feel like home base.</p>
          <a href="#featured" aria-label="Shop RuR gear" className="story-arrow"><ArrowIcon /></a>
        </section>
      </main>
      <Footer />
    </div>
  )
}
