import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AugmenticsLogoMark } from '../components/Logo'
import { useBreakpoint } from '../hooks/useBreakpoint'

const C = {
  bg:      '#F0F2F8',
  white:   '#FFFFFF',
  navy:    '#09112A',
  navyMd:  '#111E3C',
  blue:    '#1B5FD8',
  blueLt:  '#3B7EF6',
  bluePl:  '#EBF1FD',
  t1:      '#0D1117',
  t2:      '#374151',
  t3:      '#6B7280',
  t4:      '#9CA3AF',
  border:  '#E5E7EB',
  green:   '#059669',
  red:     '#DC2626',
  redPl:   '#FEF2F2',
}

// Google SVG icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
)

const FeatureIcon = {
  portfolio: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4"/>
    </svg>
  ),
  payment: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </svg>
  ),
  maintenance: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  ai: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 14v2M16 14v2"/>
    </svg>
  ),
}

const features = [
  { icon: FeatureIcon.portfolio,   title: 'Portfolio Overview',    desc: 'All properties, units, and occupancy at a glance' },
  { icon: FeatureIcon.payment,     title: 'Live Payment Tracking', desc: 'Tenants submit payments directly — you see them instantly' },
  { icon: FeatureIcon.maintenance, title: 'Maintenance Management',desc: 'Tenants log issues, you track and assign in real time' },
  { icon: FeatureIcon.ai,          title: 'AI Assistant',          desc: 'Ask questions about your portfolio in plain English' },
]

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()
  const { isMobile } = useBreakpoint()

  const [mode, setMode]         = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Check your email for a password reset link.')
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.')
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        const { error, needsConfirmation } = await signUpWithEmail(email, password, name, 'owner')
        if (error) throw error
        if (needsConfirmation) {
          setMessage('Account created! Check your email to confirm your address, then sign in.')
          setMode('signin')
        }
        // If no needsConfirmation, session was returned and onAuthStateChange will redirect automatically
      } else {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const inputStyle = (focused) => ({
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${focused ? C.blue : C.border}`,
    borderRadius: 8, fontSize: 13, color: C.t1,
    background: C.white, outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'Inter, sans-serif',
    boxShadow: focused ? `0 0 0 3px ${C.blue}14` : 'none',
  })

  const [focusedField, setFocusedField] = useState(null)

  const titles = {
    signin: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
  }
  const subtitles = {
    signin: 'Sign in to your Leadlink Solutions dashboard',
    signup: 'Set up your property management account',
    forgot: "We'll send a reset link to your email",
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL — hidden on mobile ── */}
      <div style={{
        width: '55%', background: C.navy,
        display: isMobile ? 'none' : 'flex', flexDirection: 'column',
        padding: '48px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: `${C.blue}18`, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: `${C.blueLt}10`, pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
          <AugmenticsLogoMark size={44} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', letterSpacing: '0.4px', fontFamily: "'Syne', sans-serif" }}>
              LEADLINK <span style={{ color: C.blueLt }}>SOLUTIONS</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '1.4px', textTransform: 'uppercase', marginTop: 1 }}>
              Property Management
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#F1F5F9', lineHeight: 1.2, marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
            Manage your<br />
            <span style={{ color: C.blueLt }}>entire portfolio</span><br />
            in one place.
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 48, maxWidth: 380 }}>
            Track rent, maintenance, and tenants across all your properties — with live updates and AI-powered insights.
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${C.blue}30`, border: `1px solid ${C.blue}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blueLt,
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ fontSize: 11, color: '#334155', marginTop: 48 }}>
          © 2026 Leadlink Solutions · Dubai, UAE · All rights reserved
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: isMobile ? '100%' : '45%',
        background: C.white,
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center',
        padding: isMobile ? '40px 24px' : '48px 56px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo — mobile only (left panel is hidden) */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <AugmenticsLogoMark size={36} onDark={false} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, letterSpacing: '0.3px', fontFamily: 'Syne, sans-serif' }}>
                  LEADLINK <span style={{ color: C.blue }}>SOLUTIONS</span>
                </div>
                <div style={{ fontSize: 10, color: C.t3, letterSpacing: '1px', textTransform: 'uppercase' }}>Property Management</div>
              </div>
            </div>
          )}

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, fontFamily: 'Syne, sans-serif', marginBottom: 6 }}>
              {titles[mode]}
            </div>
            <div style={{ fontSize: 13, color: C.t3 }}>{subtitles[mode]}</div>
          </div>

          {/* Mode tabs (signin/signup only) */}
          {mode !== 'forgot' && (
            <div style={{
              display: 'flex', background: C.bg, borderRadius: 8, padding: 4, marginBottom: 28,
            }}>
              {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([m, lbl]) => (
                <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 6, border: 'none',
                    background: mode === m ? C.white : 'transparent',
                    color: mode === m ? C.t1 : C.t3,
                    fontWeight: mode === m ? 600 : 400,
                    fontSize: 13, cursor: 'pointer',
                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}>{lbl}</button>
              ))}
            </div>
          )}

          {/* Google button */}
          {mode !== 'forgot' && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '11px 16px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${C.border}`, background: C.white,
                  fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: 'inherit',
                  transition: 'all 0.15s', marginBottom: 20,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.t4 }}
                onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.t4, fontWeight: 500 }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            </>
          )}

          {/* Error / success messages */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.red }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.green }}>
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Full name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                  <input
                    type="text" placeholder="Khaled Hamza" value={name}
                    onChange={e => setName(e.target.value)} required
                    style={inputStyle(focusedField === 'name')}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email" placeholder="khaled@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={inputStyle(focusedField === 'email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Password — not on forgot */}
              {mode !== 'forgot' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                      value={password} onChange={e => setPassword(e.target.value)} required
                      style={{ ...inputStyle(focusedField === 'pass'), paddingRight: 44 }}
                      onFocus={() => setFocusedField('pass')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.t3, fontSize: 11, fontFamily: 'inherit', fontWeight: 600 }}>
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {mode === 'signin' && (
                    <div style={{ textAlign: 'right', marginTop: 6 }}>
                      <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                        style={{ fontSize: 11, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', marginTop: 24, padding: '12px',
                background: loading ? '#94A3B8' : C.blue,
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s',
                boxShadow: loading ? 'none' : `0 4px 14px ${C.blue}40`,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1249B0' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.blue }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to sign in from forgot */}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('signin'); setError(''); setMessage('') }}
              style={{ marginTop: 16, width: '100%', background: 'none', border: 'none', color: C.blue, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back to Sign In
            </button>
          )}

          {/* Footer note */}
          <div style={{ marginTop: 24, fontSize: 11, color: C.t4, textAlign: 'center', lineHeight: 1.6 }}>
            {mode === 'signup'
              ? 'By creating an account you agree to our Terms of Service and Privacy Policy.'
              : 'Secure login powered by Supabase · Data stored in Dubai-region servers.'}
          </div>

          {/* Tenant portal link */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#F8FAFF', border: `1px solid ${C.border}`, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 6 }}>Are you a <strong style={{ color: C.t2 }}>tenant</strong>?</div>
            <a href="#/tenant-login" style={{ fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><path d="M8 11v1M8 5v4"/><path d="M21 21l-4.35-4.35"/></svg>
              Access Tenant Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
