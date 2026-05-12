import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AugmenticsLogoMark } from '../components/Logo'
import { useBreakpoint } from '../hooks/useBreakpoint'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#F0F2F8',
  white:     '#FFFFFF',
  sidebar:   '#09112A',
  blue:      '#1B5FD8',
  blueDk:    '#1249B0',
  blueLt:    '#3B7EF6',
  bluePl:    '#EBF1FD',
  blueAlpha: 'rgba(27,95,216,0.1)',
  t1:        '#0D1117',
  t2:        '#374151',
  t3:        '#6B7280',
  t4:        '#9CA3AF',
  border:    '#E5E7EB',
  borderMd:  '#D1D5DB',
  green:     '#059669',
  greenDk:   '#047857',
  greenPl:   '#D1FAE5',
  greenAlpha:'rgba(5,150,105,0.12)',
  amber:     '#D97706',
  amberPl:   '#FEF3C7',
  amberAlpha:'rgba(217,119,6,0.12)',
  red:       '#DC2626',
  redPl:     '#FEE2E2',
  redAlpha:  'rgba(220,38,38,0.12)',
}

const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtAED  = n => `${localStorage.getItem('aug_currency') || 'AED'} ${Number(n || 0).toLocaleString()}`

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  home:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  payment:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  wrench:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  logout:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  mapPin:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  user:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  clock:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  refresh:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Badge({ s }) {
  const map = {
    paid:        { bg: C.greenAlpha,  color: C.greenDk, label: 'Paid' },
    Paid:        { bg: C.greenAlpha,  color: C.greenDk, label: 'Paid' },
    resolved:    { bg: C.greenAlpha,  color: C.greenDk, label: 'Resolved' },
    Resolved:    { bg: C.greenAlpha,  color: C.greenDk, label: 'Resolved' },
    pending:     { bg: C.amberAlpha,  color: C.amber,   label: 'Pending' },
    Pending:     { bg: C.amberAlpha,  color: C.amber,   label: 'Pending' },
    in_progress: { bg: C.blueAlpha,   color: C.blue,    label: 'In Progress' },
    open:        { bg: C.redAlpha,    color: C.red,     label: 'Open' },
    Open:        { bg: C.redAlpha,    color: C.red,     label: 'Open' },
    overdue:     { bg: C.redAlpha,    color: C.red,     label: 'Overdue' },
    Overdue:     { bg: C.redAlpha,    color: C.red,     label: 'Overdue' },
    high:        { bg: C.redAlpha,    color: C.red,     label: 'High' },
    medium:      { bg: C.amberAlpha,  color: C.amber,   label: 'Medium' },
    low:         { bg: '#F3F4F6',     color: C.t3,      label: 'Low' },
  }
  const { bg, color, label } = map[s] || map.pending
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

const inputSt = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.borderMd}`,
  fontSize: 13, color: C.t1, fontFamily: 'inherit', outline: 'none', background: C.white,
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.t3, display: 'flex', padding: 4, borderRadius: 6 }}>{Icon.x}</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Submit Payment Modal ─────────────────────────────────────────────────────
function SubmitPaymentModal({ lease, onClose, onSaved }) {
  const { profile } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    amount:    lease?.monthly_rent || '',
    dueDate:   today,
    paidDate:  today,
    method:    'bank_transfer',
    notes:     '',
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { setErr('Enter a valid amount.'); return }
    setBusy(true); setErr('')
    try {
      const { error } = await supabase.from('payments').insert({
        property_id:    lease?.units?.property_id || null,
        lease_id:       lease?.id || null,
        tenant_id:      profile.id,
        amount:         Number(form.amount),
        due_date:       form.dueDate,
        paid_date:      form.paidDate || null,
        status:         'paid',
        payment_method: form.method || null,
        notes:          form.notes.trim() || null,
      })
      if (error) throw error
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex.message || 'Failed to submit payment.')
    } finally { setBusy(false) }
  }

  return (
    <Modal title="Submit Payment" onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.bluePl, border: `1px solid ${C.blue}30`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: C.blue }}>
            <strong>{lease?.units?.properties?.name}</strong> · Unit {lease?.units?.unit_number} · Monthly rent: {fmtAED(lease?.monthly_rent)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Amount (AED) *">
              <input style={inputSt} type="number" min="0" value={form.amount} onChange={set('amount')} required />
            </Field>
            <Field label="Payment Method">
              <select style={{ ...inputSt, appearance: 'none' }} value={form.method} onChange={set('method')}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Due Date *">
              <input style={inputSt} type="date" value={form.dueDate} onChange={set('dueDate')} required />
            </Field>
            <Field label="Paid Date">
              <input style={inputSt} type="date" value={form.paidDate} onChange={set('paidDate')} />
            </Field>
          </div>
          <Field label="Notes / Reference">
            <input style={inputSt} value={form.notes} onChange={set('notes')} placeholder="Transaction ref, receipt number…" />
          </Field>
          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, borderRadius: 8, padding: '10px 14px' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={busy} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: busy ? C.t4 : C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {busy ? 'Submitting…' : 'Submit Payment'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ─── Report Issue Modal ───────────────────────────────────────────────────────
function ReportIssueModal({ lease, onClose, onSaved }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({ issue: '', priority: 'medium' })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.issue.trim()) { setErr('Describe the issue.'); return }
    if (!lease?.unit_id)    { setErr('No active lease found. Contact your property manager.'); return }
    setBusy(true); setErr('')
    try {
      const { error } = await supabase.from('maintenance_requests').insert({
        unit_id:   lease.unit_id,
        tenant_id: profile.id,
        issue:     form.issue.trim(),
        priority:  form.priority,
        status:    'open',
        assignee:  'Unassigned',
      })
      if (error) throw error
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex.message || 'Failed to submit request.')
    } finally { setBusy(false) }
  }

  return (
    <Modal title="Report Maintenance Issue" onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.amberAlpha, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: C.amber }}>
            <strong>{lease?.units?.properties?.name}</strong> · Unit {lease?.units?.unit_number}
          </div>
          <Field label="Describe the Issue *">
            <textarea
              style={{ ...inputSt, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
              value={form.issue} onChange={set('issue')}
              placeholder="e.g. Leaking tap in bathroom, AC not cooling, broken lock…"
              required
            />
          </Field>
          <Field label="Priority">
            <select style={{ ...inputSt, appearance: 'none' }} value={form.priority} onChange={set('priority')}>
              <option value="low">Low — non-urgent</option>
              <option value="medium">Medium — fix within a few days</option>
              <option value="high">High — urgent, affects living</option>
            </select>
          </Field>
          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, borderRadius: 8, padding: '10px 14px' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.t2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={busy} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: busy ? C.t4 : C.amber, color: '#fff', fontSize: 13, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {busy ? 'Submitting…' : 'Report Issue'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ─── Tab nav bar ──────────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'Home',        icon: Icon.home,    label: 'Home' },
    { id: 'Payments',    icon: Icon.payment, label: 'Payments' },
    { id: 'Maintenance', icon: Icon.wrench,  label: 'Maintenance' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 600,
          background: tab === t.id ? C.white : 'transparent',
          color: tab === t.id ? C.blue : C.t3,
          boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.15s',
        }}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ lease, payments, maintenance, onPayNow, onReportIssue }) {
  const { isMobile } = useBreakpoint()
  if (!lease) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>No Active Lease</div>
      <div style={{ fontSize: 14, color: C.t3, maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
        You don't have an active lease linked to your account. Contact your property manager to get set up.
      </div>
    </div>
  )

  const daysLeft   = Math.round((new Date(lease.end_date).getTime() - Date.now()) / 86400000)
  const openMaint  = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length
  const lastPay    = payments.find(p => p.status === 'paid')
  const nextDueRaw = payments.find(p => p.status === 'pending' || p.status === 'overdue')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Lease overview */}
      <div style={{ background: `linear-gradient(135deg, ${C.sidebar} 0%, #1A3060 100%)`, borderRadius: 16, padding: '24px 26px', color: '#fff' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Your Lease</div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{lease.units?.properties?.name}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          {Icon.mapPin}
          Unit {lease.units?.unit_number} · {lease.units?.properties?.address || lease.units?.properties?.city || ''}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 10 : 16 }}>
          {[
            ['Monthly Rent',   fmtAED(lease.monthly_rent)],
            ['Lease Ends',     fmtDate(lease.end_date)],
            ['Days Remaining', daysLeft < 0 ? 'Expired' : daysLeft],
          ].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: l === 'Days Remaining' && daysLeft < 60 && daysLeft >= 0 ? '#FCD34D' : '#fff' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
        {/* Next payment */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Next Payment</div>
            <span style={{ background: nextDueRaw ? C.amberAlpha : C.greenAlpha, color: nextDueRaw ? C.amber : C.greenDk, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
              {nextDueRaw ? 'Due' : 'Up to date'}
            </span>
          </div>
          {nextDueRaw
            ? <>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.t1, fontFamily: "'Syne', sans-serif" }}>{fmtAED(nextDueRaw.amount)}</div>
                <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>Due {fmtDate(nextDueRaw.due_date)}</div>
              </>
            : <>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.greenDk, fontFamily: "'Syne', sans-serif" }}>{fmtAED(lease.monthly_rent)}</div>
                <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>Monthly rent · no pending dues</div>
              </>
          }
          <button onClick={onPayNow} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Submit Payment
          </button>
        </div>

        {/* Maintenance summary */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Maintenance</div>
            {openMaint > 0 && <span style={{ background: C.amberAlpha, color: C.amber, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{openMaint} open</span>}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.t1, fontFamily: "'Syne', sans-serif" }}>{maintenance.length}</div>
          <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>
            {maintenance.length === 0 ? 'No requests logged' : `${openMaint} open · ${maintenance.length - openMaint} resolved`}
          </div>
          <button onClick={onReportIssue} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.t1, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Report an Issue
          </button>
        </div>
      </div>

      {/* Recent activity */}
      {(payments.length > 0 || maintenance.length > 0) && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Recent Activity
          </div>
          <div>
            {[
              ...payments.slice(0, 3).map(p => ({ type: 'payment', date: p.paid_date || p.due_date, label: `Payment — ${fmtAED(p.amount)}`, status: p.status })),
              ...maintenance.slice(0, 3).map(m => ({ type: 'maint', date: m.created_at, label: m.issue, status: m.status })),
            ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.type === 'payment' ? C.greenAlpha : C.amberAlpha, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'payment' ? C.greenDk : C.amber, flexShrink: 0 }}>
                  {item.type === 'payment' ? Icon.payment : Icon.wrench}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{item.date ? fmtDate(item.date) : '—'}</div>
                </div>
                <Badge s={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, lease, onPay }) {
  const { isMobile } = useBreakpoint()
  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 16 }}>
        {[
          ['Total Payments', payments.length, C.t1, null],
          ['Total Paid',     fmtAED(totalPaid), C.greenDk, C.greenAlpha],
          ['Outstanding',    fmtAED(totalPending), totalPending > 0 ? C.red : C.t3, totalPending > 0 ? C.redAlpha : '#F3F4F6'],
        ].map(([l, v, color, bg]) => (
          <div key={l} style={{ background: bg || C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Syne', sans-serif" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onPay} disabled={!lease} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9, border: 'none', background: lease ? C.blue : C.t4, color: '#fff', fontSize: 13, fontWeight: 600, cursor: lease ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
          {Icon.plus} Submit Payment
        </button>
      </div>

      {/* Payment history */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Payment History</div>
        {payments.length === 0
          ? <div style={{ padding: '40px 20px', textAlign: 'center', color: C.t3, fontSize: 13 }}>No payments recorded yet.</div>
          : isMobile
            ? payments.map((p, i) => (
                <div key={p.id} style={{ padding: '13px 16px', borderBottom: i < payments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{fmtAED(p.amount)}</span>
                    <Badge s={p.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: C.t3 }}>{p.paid_date ? fmtDate(p.paid_date) : p.due_date ? fmtDate(p.due_date) : '—'}</span>
                    <span style={{ fontSize: 12, color: C.t3, textTransform: 'capitalize' }}>{(p.payment_method || '—').replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            : <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Date', 'Amount', 'Method', 'Status', 'Notes'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '13px 16px', color: C.t2 }}>{p.paid_date ? fmtDate(p.paid_date) : p.due_date ? fmtDate(p.due_date) : '—'}</td>
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: C.t1 }}>{fmtAED(p.amount)}</td>
                        <td style={{ padding: '13px 16px', color: C.t3, textTransform: 'capitalize' }}>{(p.payment_method || '—').replace('_', ' ')}</td>
                        <td style={{ padding: '13px 16px' }}><Badge s={p.status} /></td>
                        <td style={{ padding: '13px 16px', color: C.t3, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>
    </div>
  )
}

// ─── Maintenance Tab ──────────────────────────────────────────────────────────
function MaintenanceTab({ maintenance, lease, onReport }) {
  const prioColor = { high: C.red, medium: C.amber, low: C.t3 }
  const statusLabel = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: C.t3 }}>
          {maintenance.length} request{maintenance.length !== 1 ? 's' : ''} logged for your unit
        </div>
        <button onClick={onReport} disabled={!lease} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9, border: 'none', background: lease ? C.amber : C.t4, color: '#fff', fontSize: 13, fontWeight: 600, cursor: lease ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
          {Icon.wrench} Report Issue
        </button>
      </div>

      {/* Requests */}
      {maintenance.length === 0
        ? <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 6 }}>All good!</div>
            <div style={{ fontSize: 13, color: C.t3 }}>No maintenance requests logged for your unit.</div>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {maintenance.map(m => (
              <div key={m.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: prioColor[m.priority] || C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', background: `${prioColor[m.priority]}18`, padding: '2px 8px', borderRadius: 4 }}>
                        {m.priority}
                      </span>
                      <span style={{ fontSize: 11, color: C.t3 }}>{m.created_at ? fmtDate(m.created_at) : '—'}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, lineHeight: 1.5 }}>{m.issue}</div>
                    {m.assignee && m.assignee !== 'Unassigned' && (
                      <div style={{ fontSize: 12, color: C.t3, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icon.user} Assigned to {m.assignee}
                      </div>
                    )}
                  </div>
                  <Badge s={m.status} />
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ─── Main TenantPortal ────────────────────────────────────────────────────────
export default function TenantPortal() {
  const { profile, signOut } = useAuth()
  const { isMobile } = useBreakpoint()

  const [tab,         setTab]         = useState('Home')
  const [lease,       setLease]       = useState(null)
  const [payments,    setPayments]    = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showPay,     setShowPay]     = useState(false)
  const [showMaint,   setShowMaint]   = useState(false)
  const [liveTag,     setLiveTag]     = useState(false)

  const fetchData = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return }

    // Step 1: get active lease
    const { data: leaseData } = await supabase
      .from('leases')
      .select(`
        id, unit_id, monthly_rent, start_date, end_date, status, notes,
        units(id, unit_number, floor, rent_amount, property_id, properties(id, name, code, type, city, address))
      `)
      .eq('tenant_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setLease(leaseData || null)

    // Step 2: fetch payments and maintenance in parallel
    const [payRes, maintRes] = await Promise.all([
      supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100),

      leaseData
        ? supabase
            .from('maintenance_requests')
            .select('id, unit_id, issue, priority, status, assignee, created_at')
            .eq('unit_id', leaseData.unit_id)
            .order('created_at', { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [] }),
    ])

    if (payRes.data)   setPayments(payRes.data)
    if (maintRes.data) setMaintenance(maintRes.data)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime subscriptions
  useEffect(() => {
    if (!profile?.id) return

    const payChannel = supabase
      .channel('tenant-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `tenant_id=eq.${profile.id}` }, () => {
        fetchData()
        setLiveTag(true)
        setTimeout(() => setLiveTag(false), 2500)
      })
      .subscribe()

    let maintChannel = null
    if (lease?.unit_id) {
      maintChannel = supabase
        .channel('tenant-maintenance')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests', filter: `unit_id=eq.${lease.unit_id}` }, () => {
          fetchData()
          setLiveTag(true)
          setTimeout(() => setLiveTag(false), 2500)
        })
        .subscribe()
    }

    return () => {
      supabase.removeChannel(payChannel)
      if (maintChannel) supabase.removeChannel(maintChannel)
    }
  }, [profile?.id, lease?.unit_id, fetchData])

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Tenant'
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const onSaved = () => fetchData()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${C.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 13, color: C.t3 }}>Loading your portal…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: isMobile ? '0 16px' : '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AugmenticsLogoMark size={28} onDark={false} />
          {!isMobile && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.t1, fontFamily: "'Syne', sans-serif", letterSpacing: '1.2px', lineHeight: 1 }}>
                AUGMENTICS <span style={{ color: C.blue }}>AI</span>
              </div>
              <div style={{ fontSize: 10, color: C.t3, letterSpacing: '1.4px', textTransform: 'uppercase', marginTop: 3, fontWeight: 500 }}>Tenant Portal</div>
            </div>
          )}
          {isMobile && <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif" }}>Tenant Portal</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
          {liveTag && !isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.greenDk, background: C.greenAlpha, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              Live update
            </div>
          )}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          {!isMobile && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, lineHeight: 1.2 }}>{displayName}</div>
              <div style={{ fontSize: 11, color: C.t3 }}>Tenant</div>
            </div>
          )}
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.t2, background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {Icon.logout} {!isMobile && 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '20px 14px' : '28px 24px' }}>
        {/* Welcome + tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.t1, fontFamily: "'Syne', sans-serif" }}>Hello, {displayName.split(' ')[0]}</div>
            <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>
              {lease ? `${lease.units?.properties?.name} · Unit ${lease.units?.unit_number}` : 'No active lease found'}
            </div>
          </div>
          <TabBar tab={tab} setTab={setTab} />
        </div>

        {/* Tab content */}
        {tab === 'Home'        && <HomeTab lease={lease} payments={payments} maintenance={maintenance} onPayNow={() => setShowPay(true)} onReportIssue={() => setShowMaint(true)} />}
        {tab === 'Payments'    && <PaymentsTab payments={payments} lease={lease} onPay={() => setShowPay(true)} />}
        {tab === 'Maintenance' && <MaintenanceTab maintenance={maintenance} lease={lease} onReport={() => setShowMaint(true)} />}
      </div>

      {/* Modals */}
      {showPay   && lease && <SubmitPaymentModal lease={lease} onClose={() => setShowPay(false)}   onSaved={onSaved} />}
      {showMaint && lease && <ReportIssueModal   lease={lease} onClose={() => setShowMaint(false)} onSaved={onSaved} />}
    </div>
  )
}
