import { useState } from 'react'
import ArrowIcon from '../Utils/ArrowIcon'

export default function AuthPage({ mode, setMode, role, setRole, onSuccess, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', adminInviteCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isRegistering = mode === 'register'

  async function submitForm(event) {
    event.preventDefault()
    setError('')
    if (isRegistering && form.password !== form.confirmPassword) {
      setError('Those passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/' + (isRegistering ? 'register' : 'login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(isRegistering
          ? { name: form.name, email: form.email, password: form.password, role, adminInviteCode: form.adminInviteCode }
          : { email: form.email, password: form.password, role }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'We could not sign you in. Please try again.')
      onSuccess(result.user)
    } catch (requestError) {
      setError(requestError.message || 'The server is unavailable. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art-grid" />
        <div className="auth-art-ring" />
        <div className="auth-art-copy">
          <span>RUR / PLAYER ACCESS</span>
          <strong>READY.<br />UP.<br /><i>REPEAT.</i></strong>
          <small>YOUR NEXT LEVEL STARTS HERE.</small>
        </div>
        <div className="auth-art-coordinate">SECURE SESSION <b>● ONLINE</b></div>
      </div>

      <section className="auth-content">
        <button className="auth-back" onClick={onBack}>← <span>Back to store</span></button>
        <a className="brand auth-brand" href="#home">
          <span className="brand-mark">R<span>u</span>R</span>
          <span className="brand-caption">READY. UP. REPEAT.</span>
        </a>
        <div className="auth-form-wrap">
          <div className="eyebrow"><span /> {isRegistering ? 'JOIN THE COMMUNITY' : role === 'admin' ? 'ADMIN CONSOLE' : 'PLAYER ACCESS'}</div>
          <h1>{isRegistering ? <>CREATE YOUR<br /><span>ACCOUNT.</span></> : <>GOOD TO<br /><span>HAVE YOU BACK.</span></>}</h1>
          <p className="auth-description">
            {isRegistering
              ? 'Save your loadout, track orders, and get first access to new drops.'
              : role === 'admin'
                ? 'Sign in with your RuR administrator credentials.'
                : 'Sign in to pick up where your next-level setup left off.'}
          </p>

          <div className="role-switch" aria-label="Account type">
            <button type="button" className={role === 'user' ? 'selected' : ''} onClick={() => setRole('user')}>Player</button>
            <button type="button" className={role === 'admin' ? 'selected' : ''} onClick={() => setRole('admin')}>Administrator</button>
          </div>

          <form className="auth-form" onSubmit={submitForm}>
            {isRegistering && (
              <label>FULL NAME
                <input autoComplete="name" required maxLength={60} placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            {isRegistering && role === 'admin' && (
              <label>ADMIN INVITE CODE
                <input type="password" autoComplete="off" required placeholder="Provided by your RuR administrator" value={form.adminInviteCode} onChange={(event) => setForm({ ...form, adminInviteCode: event.target.value })} />
              </label>
            )}
            <label>EMAIL ADDRESS
              <input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>PASSWORD
              <input type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} required minLength={8} placeholder="At least 8 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            {isRegistering && (
              <label>CONFIRM PASSWORD
                <input type="password" autoComplete="new-password" required minLength={8} placeholder="Enter your password again" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
              </label>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : isRegistering ? 'Create account' : role === 'admin' ? 'Admin sign in' : 'Sign in'}
              <ArrowIcon />
            </button>
          </form>
          <p className="auth-switch">
            {isRegistering ? 'Already have an account?' : 'New to RuR?'}
            <button onClick={() => { setError(''); setMode(isRegistering ? 'login' : 'register') }}>
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          {isRegistering && <p className="auth-footnote">Administrator registration requires a valid invite code configured by the RuR team.</p>}
        </div>
        <div className="auth-legal">SECURE ACCESS <span>·</span> BUILT FOR YOUR NEXT ROUND</div>
      </section>
    </main>
  )
}
