import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LOGO_SRC = `${import.meta.env.BASE_URL}augmentics-logo.png`

// Styles are embedded so the design from Augmentics-AI/Sign In.html is preserved
// pixel-faithfully (gradients, mask, hover transitions, focus rings, etc.).
const CSS = `
.la-page{
  --bg:#ffffff; --ink:#0B1220; --ink-2:#1A2233;
  --muted:#5B6577; --muted-2:#8893A4;
  --line:#E6E9EE; --line-2:#EEF1F5; --field:#F6F8FA;
  --brand:#1F6BFF; --brand-600:#1559E6; --brand-700:#1149BD;
  --night:#0A1020; --night-2:#0E1628; --night-3:#131D34;
  --on-night:#E7ECF5; --on-night-muted:#9AA6BD;
  --on-night-line:rgba(255,255,255,.08);
  --radius:12px;
  display:grid; grid-template-columns:1.05fr .95fr; min-height:100vh;
  font-family:"Inter",ui-sans-serif,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  font-feature-settings:"cv11","ss01","ss03";
  color:var(--ink); background:var(--bg);
}
.la-hero{
  position:relative;
  background:
    radial-gradient(1100px 600px at -10% -10%, rgba(31,107,255,.22), transparent 60%),
    radial-gradient(900px 700px at 110% 110%, rgba(31,107,255,.10), transparent 55%),
    linear-gradient(180deg,#0A1020 0%,#0B1326 60%,#0A1020 100%);
  color:var(--on-night);
  padding:40px 56px 40px;
  display:flex; flex-direction:column;
  overflow:hidden; isolation:isolate;
}
.la-hero::before{
  content:""; position:absolute; inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
  background-size:48px 48px; background-position:-1px -1px;
  -webkit-mask-image:radial-gradient(ellipse at 30% 40%, #000 30%, transparent 80%);
          mask-image:radial-gradient(ellipse at 30% 40%, #000 30%, transparent 80%);
  z-index:-1;
}
.la-hero::after{
  content:""; position:absolute; right:-160px; top:-160px;
  width:520px; height:520px; border-radius:50%;
  background:radial-gradient(closest-side, rgba(31,107,255,.35), rgba(31,107,255,0) 70%);
  filter:blur(6px); z-index:-1;
}
.la-brand{ display:flex; align-items:center; gap:12px; position:relative; z-index:1 }
.la-brand-mark{
  width:40px; height:40px; display:grid; place-items:center;
  border:1px solid var(--on-night-line);
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,0));
  border-radius:10px;
}
.la-brand-mark img{ width:26px; height:26px; display:block }
.la-brand-name{ display:flex; flex-direction:column; line-height:1 }
.la-brand-name .row1{
  font-family:"Montserrat",sans-serif; font-weight:700;
  letter-spacing:.02em; font-size:16px;
}
.la-brand-name .row1 em{ font-style:normal; color:var(--brand) }
.la-brand-name .row2{
  font-size:10.5px; letter-spacing:.22em; color:var(--on-night-muted);
  margin-top:6px; text-transform:uppercase;
}

.la-hero-body{ margin-top:auto; padding-top:56px; max-width:560px; position:relative; z-index:1 }
.la-eyebrow{
  display:inline-flex; align-items:center; gap:8px;
  border:1px solid var(--on-night-line);
  background:rgba(255,255,255,.03);
  border-radius:999px; padding:6px 12px;
  color:var(--on-night-muted);
  font-size:11.5px; letter-spacing:.16em; text-transform:uppercase; font-weight:600;
}
.la-eyebrow .dot{
  width:6px; height:6px; border-radius:50%;
  background:var(--brand); box-shadow:0 0 0 4px rgba(31,107,255,.18);
}
.la-headline{
  font-family:"Montserrat",sans-serif; font-weight:600;
  font-size:60px; line-height:1.04; letter-spacing:-0.025em;
  margin:22px 0 18px; color:#F4F7FC; text-wrap:balance;
}
.la-headline .accent{ color:var(--brand) }
.la-lede{ color:var(--on-night-muted); font-size:16px; line-height:1.6; max-width:520px; margin:0 }

.la-features{ margin-top:44px; display:grid; gap:14px; max-width:560px }
.la-feature{
  display:grid; grid-template-columns:42px 1fr auto; gap:16px; align-items:center;
  border:1px solid var(--on-night-line);
  background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,0));
  border-radius:14px; padding:14px 16px;
  transition:border-color .18s ease, background .18s ease;
}
.la-feature:hover{ border-color:rgba(31,107,255,.45); background:rgba(31,107,255,.05) }
.la-feature .icon{
  width:42px; height:42px; border-radius:10px; display:grid; place-items:center;
  background:rgba(31,107,255,.14); border:1px solid rgba(31,107,255,.25);
  color:#A9C4FF;
}
.la-feature .title{ font-size:14.5px; font-weight:600; color:#EAF0FB; letter-spacing:-.005em }
.la-feature .desc{ font-size:13px; color:var(--on-night-muted); margin-top:2px; line-height:1.45 }
.la-feature .kbd{ font-size:10.5px; letter-spacing:.16em; color:#6E7C97; text-transform:uppercase }

.la-hero-foot{
  margin-top:auto; padding-top:36px;
  display:flex; justify-content:space-between; align-items:center;
  color:#6E7C97; font-size:12px; letter-spacing:.04em;
  position:relative; z-index:1;
}
.la-hero-foot .sep{ margin:0 10px; opacity:.5 }

/* ---------- AUTH (right) ---------- */
.la-auth{
  display:flex; flex-direction:column;
  padding:32px 56px 32px;
  background:#fff; position:relative;
}
.la-auth-top{
  display:flex; justify-content:flex-end; align-items:center; gap:10px;
  color:var(--muted); font-size:13px;
}
.la-ghost-link{
  text-decoration:none; color:var(--ink); font-weight:600;
  padding:8px 14px; border:1px solid var(--line); border-radius:8px; background:#fff;
  cursor:pointer; font-family:inherit; font-size:13px;
  transition:background .15s ease, border-color .15s ease;
}
.la-ghost-link:hover{ background:var(--field); border-color:#D6DBE3 }

.la-card{
  margin:auto 0; width:100%; max-width:440px; margin-left:auto; margin-right:auto;
  padding:8px 0;
}
.la-auth-eyebrow{
  font-size:12px; letter-spacing:.16em; text-transform:uppercase;
  color:var(--muted-2); font-weight:600;
}
.la-auth-title{
  font-family:"Montserrat",sans-serif; font-weight:600;
  font-size:34px; line-height:1.1; letter-spacing:-.022em;
  margin:10px 0 8px; color:var(--ink);
}
.la-auth-sub{ font-size:14.5px; color:var(--muted); line-height:1.55; margin:0 }

.la-tabs{
  margin-top:24px; display:grid; grid-template-columns:1fr 1fr; gap:6px;
  padding:5px; background:var(--field); border-radius:10px; border:1px solid var(--line);
}
.la-tab{
  border:0; background:transparent; padding:10px 12px; border-radius:7px;
  font-weight:600; font-size:13.5px; color:var(--muted); cursor:pointer;
  letter-spacing:-.005em; font-family:inherit;
  transition:background .15s ease, color .15s ease, box-shadow .15s ease;
}
.la-tab[aria-selected="true"]{
  background:#fff; color:var(--ink);
  box-shadow:0 1px 2px rgba(11,18,32,.06),0 0 0 1px rgba(11,18,32,.04);
}

.la-oauth{
  margin-top:18px; display:flex; align-items:center; justify-content:center; gap:10px;
  width:100%; padding:11px 14px; border-radius:10px; border:1px solid var(--line);
  background:#fff; font-weight:600; font-size:14px; color:var(--ink);
  cursor:pointer; font-family:inherit;
  transition:background .15s ease, border-color .15s ease;
}
.la-oauth:hover{ background:var(--field); border-color:#D6DBE3 }
.la-oauth:disabled{ opacity:.6; cursor:not-allowed }
.la-oauth svg{ width:18px; height:18px }

.la-divider{
  display:flex; align-items:center; gap:12px; margin:18px 0;
  color:var(--muted-2); font-size:12px;
}
.la-divider::before, .la-divider::after{ content:""; height:1px; flex:1; background:var(--line) }

.la-field{ display:flex; flex-direction:column; gap:7px; margin-bottom:14px }
.la-field label{
  font-size:12px; font-weight:600; letter-spacing:.08em;
  text-transform:uppercase; color:var(--muted);
}
.la-row-label{ display:flex; justify-content:space-between; align-items:center }
.la-input-wrap{ position:relative }
.la-input{
  width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--line);
  background:#fff; color:var(--ink); font-size:14.5px; font-family:inherit;
  transition:border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.la-input::placeholder{ color:#A5AEBE }
.la-input:hover{ border-color:#D6DBE3 }
.la-input:focus{
  outline:none; border-color:var(--brand);
  box-shadow:0 0 0 4px rgba(31,107,255,.14); background:#fff;
}
.la-input.with-icon{ padding-left:42px }
.la-input.with-trail{ padding-right:72px }
.la-input-icon{
  position:absolute; left:13px; top:50%; transform:translateY(-50%);
  color:#8C97A8; pointer-events:none;
}
.la-input-trail{
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  background:transparent; border:0; font-size:11px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--muted); font-weight:700;
  cursor:pointer; padding:6px 8px; border-radius:6px; font-family:inherit;
}
.la-input-trail:hover{ background:var(--field); color:var(--ink) }

.la-forgot{
  font-size:12.5px; color:var(--brand); text-decoration:none;
  font-weight:600; background:none; border:0; cursor:pointer;
  padding:0; font-family:inherit;
}
.la-forgot:hover{ color:var(--brand-600); text-decoration:underline }

.la-check-row{
  display:flex; align-items:center; gap:10px;
  margin:4px 0 18px; color:var(--muted); font-size:13px;
}
.la-check-row input{ width:16px; height:16px; accent-color:var(--brand) }

.la-submit{
  width:100%; padding:13px 16px; border-radius:10px; border:0; cursor:pointer;
  background:var(--brand); color:#fff; font-weight:600; font-size:14.5px;
  letter-spacing:-.005em; font-family:inherit;
  box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 6px 18px rgba(31,107,255,.28);
  transition:transform .04s ease, background .15s ease, box-shadow .15s ease;
  display:flex; align-items:center; justify-content:center; gap:10px;
}
.la-submit:hover{
  background:var(--brand-600);
  box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 8px 22px rgba(31,107,255,.34);
}
.la-submit:active{ transform:translateY(1px) }
.la-submit:disabled{ opacity:.7; cursor:not-allowed }

.la-security{
  margin-top:18px; display:flex; align-items:center; gap:10px;
  color:var(--muted); font-size:12px;
}
.la-security svg{ flex-shrink:0; color:var(--muted-2) }
.la-security .dotsep{
  width:3px; height:3px; border-radius:50%;
  background:#C8CFDA; display:inline-block; margin:0 8px; vertical-align:middle;
}

.la-tenant{
  margin-top:22px; border:1px solid var(--line); border-radius:12px; padding:14px 16px;
  display:flex; align-items:center; justify-content:space-between;
  gap:16px; background:#FAFBFD;
}
.la-tenant .t-title{ font-weight:600; color:var(--ink); font-size:13.5px }
.la-tenant .t-sub{ font-size:12.5px; color:var(--muted); margin-top:2px }
.la-tenant .t-cta{
  display:inline-flex; align-items:center; gap:6px;
  font-size:13px; font-weight:600; color:var(--brand);
  text-decoration:none; padding:8px 12px; border-radius:8px;
  border:1px solid #DBE5FB; background:#fff;
}
.la-tenant .t-cta:hover{ background:#EEF3FE }

.la-auth-foot{
  margin-top:auto; padding-top:30px;
  display:flex; justify-content:space-between; align-items:center;
  color:var(--muted-2); font-size:12px;
}
.la-auth-foot a{ text-decoration:none; color:var(--muted) }
.la-auth-foot a:hover{ color:var(--ink) }
.la-auth-foot .links{ display:flex; gap:18px }

.la-alert{
  margin-top:14px; padding:10px 13px; border-radius:8px;
  font-size:13px; font-weight:500;
}
.la-alert.err{ background:#FEF2F2; border:1px solid #FECACA; color:#B91C1C }
.la-alert.ok{ background:#ECFDF5; border:1px solid #A7F3D0; color:#047857 }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 1100px){
  .la-headline{ font-size:50px }
  .la-hero, .la-auth{ padding-left:40px; padding-right:40px }
}
@media (max-width: 880px){
  .la-page{ grid-template-columns:1fr }
  .la-hero{ padding:32px 24px 36px }
  .la-auth{ padding:24px 24px 32px }
  .la-hero-foot{ display:none }
  .la-headline{ font-size:36px }
  .la-features{ grid-template-columns:1fr }
  .la-hero-body{ padding-top:32px }
}
`

const FeatureIcon = {
  portfolio: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
  ),
  payment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>
  ),
  maintenance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4Z"/></svg>
  ),
  ai: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3"/><path d="M5.6 5.6 7.7 7.7"/><path d="M3 12h3"/><path d="M5.6 18.4 7.7 16.3"/><path d="M12 21v-3"/><path d="M18.4 18.4 16.3 16.3"/><path d="M21 12h-3"/><path d="M18.4 5.6 16.3 7.7"/><circle cx="12" cy="12" r="3.2"/></svg>
  ),
}

const features = [
  { icon: FeatureIcon.portfolio,   title: 'Portfolio Overview',     desc: 'All properties, units, and occupancy at a glance.' },
  { icon: FeatureIcon.payment,     title: 'Live Payment Tracking',  desc: 'Tenants submit payments directly — you see them instantly.' },
  { icon: FeatureIcon.maintenance, title: 'Maintenance Management', desc: 'Tenants log issues, you track and assign in real time.' },
  { icon: FeatureIcon.ai,          title: 'AI Assistant',           desc: 'Ask questions about your portfolio in plain English.' },
]

const GoogleIcon = () => (
  <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.87-3.05.87-2.34 0-4.32-1.58-5.03-3.71H.92v2.33A8.997 8.997 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.92A8.997 8.997 0 0 0 0 9c0 1.45.35 2.82.92 4.05l3.05-2.33Z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .92 4.95l3.05 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/>
  </svg>
)

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const [mode, setMode]         = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [keepSignedIn, setKeep] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)

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
          setMessage('Account created! Check your email to confirm, then sign in.')
          setMode('signin')
        }
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
    setError(''); setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
    setLoading(false)
  }

  const titles = {
    signin: 'Welcome back.',
    signup: 'Create your account.',
    forgot: 'Reset your password.',
  }
  const subtitles = {
    signin: 'Sign in to access your Augmentics AI dashboard.',
    signup: 'Set up your property management account.',
    forgot: "Enter your email — we'll send a reset link.",
  }
  const submitLabel = {
    signin: 'Sign in to dashboard',
    signup: 'Create account',
    forgot: 'Send reset link',
  }

  return (
    <>
      <style>{CSS}</style>
      <main className="la-page" data-screen-label="01 Sign In">

        {/* =================== LEFT: HERO =================== */}
        <aside className="la-hero">
          <div className="la-brand" aria-label="Augmentics AI">
            <div className="la-brand-mark"><img src={LOGO_SRC} alt="" /></div>
            <div className="la-brand-name">
              <div className="row1">Augmentics<em> AI</em></div>
              <div className="row2">Real Estate Intelligence</div>
            </div>
          </div>

          <div className="la-hero-body">
            <span className="la-eyebrow"><span className="dot" />Built for portfolio managers</span>
            <h1 className="la-headline">Intelligence for <span className="accent">every property</span> in your portfolio.</h1>
            <p className="la-lede">Track rent, maintenance, and tenant activity in real time — with live updates and AI-powered insights across every unit you manage.</p>

            <div className="la-features">
              {features.map((f, i) => (
                <div key={f.title} className="la-feature">
                  <div className="icon" aria-hidden="true">{f.icon}</div>
                  <div>
                    <div className="title">{f.title}</div>
                    <div className="desc">{f.desc}</div>
                  </div>
                  <div className="kbd">{String(i + 1).padStart(2, '0')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="la-hero-foot">
            <div>© 2026 Augmentics AI<span className="sep">·</span>Kuwait City, Kuwait</div>
            <div>v3.2 · Status: All systems operational</div>
          </div>
        </aside>

        {/* =================== RIGHT: FORM =================== */}
        <section className="la-auth">
          <div className="la-auth-top">
            {mode === 'signin' ? (
              <>
                <span>New to Augmentics?</span>
                <button className="la-ghost-link" onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create account</button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button className="la-ghost-link" onClick={() => { setMode('signin'); setError(''); setMessage('') }}>Sign in</button>
              </>
            )}
          </div>

          <div className="la-card">
            <div className="la-auth-eyebrow">Account</div>
            <h2 className="la-auth-title">{titles[mode]}</h2>
            <p className="la-auth-sub">{subtitles[mode]}</p>

            {mode !== 'forgot' && (
              <div className="la-tabs" role="tablist" aria-label="Authentication">
                <button className="la-tab" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setError(''); setMessage('') }}>Sign in</button>
                <button className="la-tab" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Sign up</button>
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <button className="la-oauth" type="button" onClick={handleGoogle} disabled={loading}>
                  <GoogleIcon />
                  Continue with Google
                </button>
                <div className="la-divider">or continue with email</div>
              </>
            )}

            <form onSubmit={handle}>
              {mode === 'signup' && (
                <div className="la-field">
                  <label htmlFor="la-name">Full name</label>
                  <div className="la-input-wrap">
                    <span className="la-input-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                    </span>
                    <input id="la-name" className="la-input with-icon" type="text" placeholder="Khaled Hamza" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="la-field">
                <label htmlFor="la-email">Email address</label>
                <div className="la-input-wrap">
                  <span className="la-input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  </span>
                  <input id="la-email" className="la-input with-icon" type="email" placeholder="khaled@example.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="la-field">
                  <div className="la-row-label">
                    <label htmlFor="la-password">Password</label>
                    {mode === 'signin' && (
                      <button type="button" className="la-forgot" onClick={() => { setMode('forgot'); setError(''); setMessage('') }}>Forgot password?</button>
                    )}
                  </div>
                  <div className="la-input-wrap">
                    <span className="la-input-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                    </span>
                    <input id="la-password" className="la-input with-icon with-trail" type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    <button type="button" className="la-input-trail" onClick={() => setShowPass(s => !s)}>{showPass ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <label className="la-check-row">
                  <input type="checkbox" checked={keepSignedIn} onChange={e => setKeep(e.target.checked)} />
                  Keep me signed in on this device
                </label>
              )}

              {error && <div className="la-alert err">{error}</div>}
              {message && <div className="la-alert ok">{message}</div>}

              <button className="la-submit" type="submit" disabled={loading}>
                {loading ? 'Please wait…' : submitLabel[mode]}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                )}
              </button>

              <div className="la-security">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8.4 8 9 4.5-.6 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
                Secure login powered by Supabase
                <span className="dotsep" />
                GCC-region data residency
              </div>
            </form>

            <div className="la-tenant" role="group" aria-label="Tenant portal">
              <div>
                <div className="t-title">Are you a tenant?</div>
                <div className="t-sub">Pay rent, submit issues, and view your lease.</div>
              </div>
              <a className="t-cta" href="#/tenant-login">
                Tenant Portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
              </a>
            </div>
          </div>

          <div className="la-auth-foot">
            <span>© Augmentics AI</span>
            <div className="links">
              <a href="#terms">Terms</a>
              <a href="#privacy">Privacy</a>
              <a href="#help">Help</a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
