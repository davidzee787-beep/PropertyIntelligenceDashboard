import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { AugmenticsLogoMark } from './components/Logo.jsx'
import LoginPage       from './pages/LoginPage.jsx'
import TenantLoginPage from './pages/TenantLoginPage.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import TenantPortal    from './pages/TenantPortal.jsx'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#09112A', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: 16,
    }}>
      <AugmenticsLogoMark size={52} onDark={true} />
      <div style={{ fontSize: 13, color: '#64748B', letterSpacing: '0.5px' }}>Loading Augmentics AI…</div>
    </div>
  )
}

function AppRoutes() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  // /tenant-login is always accessible (before auth check)
  if (location.pathname === '/tenant-login') {
    if (session && profile?.role === 'tenant') return <Navigate to="/tenant" replace />
    return <TenantLoginPage />
  }

  if (!session) return <LoginPage />

  const role = profile?.role || 'owner'

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/dashboard/*" element={role !== 'tenant' ? <Dashboard />    : <Navigate to="/tenant"    replace />} />
        <Route path="/tenant/*"    element={role === 'tenant'  ? <TenantPortal /> : <Navigate to="/dashboard" replace />} />
        <Route path="*"            element={<Navigate to={role === 'tenant' ? '/tenant' : '/dashboard'} replace />} />
      </Routes>
    </SettingsProvider>
  )
}

export default function App() {
  return <AppRoutes />
}
