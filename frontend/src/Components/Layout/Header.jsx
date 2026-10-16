import ArrowIcon from '../Utils/ArrowIcon'

export default function Header({ query, onSearch, user, onLogin, onLogout, onAdmin, cartCount }) {
  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" /> LEVEL UP YOUR SETUP
        <span className="announcement-divider">/</span> FREE SHIPPING ON ORDERS OVER $100
        <a href="#featured">SHOP NOW <ArrowIcon /></a>
      </div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="RuR home">
          <span className="brand-mark">R<span>u</span>R</span>
          <span className="brand-caption">READY. UP. REPEAT.</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#featured">Shop all</a>
          <a href="#categories">Categories</a>
          <a href="#featured">New arrivals <span className="new-tag">NEW</span></a>
          <a href="#story">Our story</a>
        </nav>
        <div className="header-actions">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search gear" placeholder="Search gear..." value={query} onChange={(event) => onSearch(event.target.value)} />
            <kbd>⌘ K</kbd>
          </label>
          {user ? (
            <>
              <button className="signed-in-button" onClick={user.role === 'admin' ? onAdmin : onLogout} title={user.role === 'admin' ? 'Open admin console' : 'Sign out'}>
                {user.role === 'admin' ? 'Admin' : user.name.split(' ')[0]} <span>{user.role === 'admin' ? '↗' : '×'}</span>
              </button>
              {user.role === 'admin' && (
                <button className="icon-button account-button" onClick={onLogout} aria-label="Sign out">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
                </button>
              )}
            </>
          ) : (
            <button className="icon-button account-button" aria-label="Sign in or create account" onClick={onLogin}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.5-3.4 3-5.3 7-5.3s6.5 1.9 7 5.3" /></svg>
            </button>
          )}
          <button className="cart-button" aria-label={`Shopping cart, ${cartCount} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
            <span>Cart</span><b>{cartCount}</b>
          </button>
        </div>
      </header>
    </>
  )
}
