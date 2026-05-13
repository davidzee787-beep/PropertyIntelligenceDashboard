import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AugmenticsLogoMark } from '../components/Logo'

const C = {
  bg:     '#F0F2F8', white: '#FFFFFF', navy: '#09112A',
  blue:   '#1B5FD8', blueLt: '#3B7EF6', bluePl: '#EBF1FD',
  t1:     '#0D1117', t2:    '#374151', t3:    '#6B7280',
  border: '#E5E7EB', green: '#059669', red: '#DC2626',
}

export default function TenantLoginPage() {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleAccess = async e => {
    e.preventDefault()
    const raw = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (raw.length !== 8) {
      setError('Please enter your full 8-character access code.')
      return
    }
    setLoading(true); setError('')
    const syntheticEmail = `${raw.toLowerCase()}@augmentics-tenants.com`
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email:    syntheticEmail,
      password: raw,
    })
    setLoading(false)
    if (authErr) {
      setError('Invalid access code. Please check the code your property manager gave you.')
    }
    // On success, onAuthStateChange in AuthContext redirects to /tenant automatically
  }

  // Format input as XXXX-XXXX
  const handleInput = e => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (val.length <= 8) {
      setCode(val.length > 4 ? `${val.slice(0, 4)}-${val.slice(4)}` : val)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 24 }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: `${C.blue}12`, pointerEvents: 'none', filter: 'blur(80px)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <AugmenticsLogoMark size={52} onDark={true} />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 800, color: '#F1F5F9', letterSpacing: '1.4px', fontFamily: "'Montserrat', sans-serif", lineHeight: 1 }}>
            AUGMENTICS <span style={{ color: C.blueLt }}>AI</span>
          </div>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: '1.6px', textTransform: 'uppercase', marginTop: 5, fontWeight: 500 }}>
            Tenant Portal
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#0F1E3A', border: '1px solid #1E3A6E', borderRadius: 16, padding: '32px 32px 28px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', fontFamily: "'Montserrat', sans-serif", marginBottom: 6 }}>
              Tenant Access
            </div>
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              Enter the access code your property manager provided
            </div>
          </div>

          <form onSubmit={handleAccess}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                  Access Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleInput}
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  autoComplete="off"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: `1.5px solid ${error ? C.red : '#1E3A6E'}`,
                    background: '#0A1628',
                    color: '#F1F5F9',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    fontFamily: "'Montserrat', monospace",
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20` }}
                  onBlur={e  => { e.target.style.borderColor = error ? C.red : '#1E3A6E'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.replace('-', '').length < 8}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 10, border: 'none',
                  background: loading || code.replace('-', '').length < 8 ? '#1E3A6E' : C.blue,
                  color: loading || code.replace('-', '').length < 8 ? '#64748B' : '#fff',
                  fontSize: 14, fontWeight: 700, cursor: loading || code.replace('-', '').length < 8 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {loading ? 'Verifying…' : 'Access My Portal →'}
              </button>
            </div>
          </form>
        </div>

        {/* Back to owner login */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>
            Property manager? <span style={{ color: C.blueLt, fontWeight: 600 }}>Sign in here →</span>
          </a>
        </div>
      </div>
    </div>
  )
}
