import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { REVENUE_MONTHS as FALLBACK_REVENUE } from '../data.js'

function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const Ctx = createContext(null)
export const useAppData = () => useContext(Ctx)

const fmtDate = d =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function toLease(l) {
  const statusMap = { active: 'Active', expired: 'Expired', terminated: 'Terminated' }
  const end = new Date(l.end_date)
  const daysLeft = isNaN(end) ? 999 : Math.round((end - Date.now()) / 86400000)
  const leaseStatus = l.status === 'active' && daysLeft < 120 ? 'Expiring' : (statusMap[l.status] || 'Active')

  // Notes may carry "Tenant: <name> | <real notes>" as a fallback when the
  // profile join is null. Extract the embedded name and the real notes.
  let embeddedName = ''
  let realNotes = l.notes || ''
  const m = /^Tenant:\s*([^|]+?)(?:\s*\|\s*(.*))?$/.exec(realNotes)
  if (m) {
    embeddedName = m[1].trim()
    realNotes = (m[2] || '').trim()
  }

  return {
    id:           l.id,
    status:       leaseStatus,
    startDate:    l.start_date ? fmtDate(l.start_date) : '—',
    endDate:      l.end_date   ? fmtDate(l.end_date)   : '—',
    daysLeft,
    monthlyRent:  Number(l.monthly_rent || 0),
    accessCode:   l.access_code || '',
    notes:        realNotes,
    tenantName:   l.profiles?.full_name || embeddedName || l.profiles?.email?.split('@')[0]?.toUpperCase() || 'Tenant',
    tenantEmail:  l.profiles?.email || '',
    tenantId:     l.profiles?.id || null,
    unitId:       l.units?.id || null,
    unitNumber:   l.units?.unit_number || '—',
    propertyId:   l.units?.properties?.id || null,
    propertyName: l.units?.properties?.name || '—',
  }
}

// ─── Row transformers ─────────────────────────────────────────────────────────

function toProperty(p) {
  const units    = p.units || []
  const occupied = units.filter(u => u.status === 'occupied')
  const occ      = units.length > 0 ? Math.round((occupied.length / units.length) * 100) : 0
  const rent     = units.filter(u => u.status === 'occupied').reduce((s, u) => s + Number(u.rent_amount || 0), 0)

  return {
    id:          p.id,
    name:        p.name,
    code:        p.code,
    type:        p.type,
    city:        p.city || '',
    address:     p.address || '',
    units:       units.length,
    occ,
    rent,
    expiry:      'See Tenants tab',
    expiryISO:   '',
    tenant:      occupied.length > 0 ? `${occupied.length} occupied` : 'Vacant',
    daysLeft:    999,
    maint:       0,
    status:      'Active',
    yearBuilt:   p.year_built    || '—',
    sqft:        p.sqft          || 0,
    floors:      p.floors        || 1,
    parkingSpots: p.parking_spots || 0,
    _units: units.map(u => ({
      id:          u.id,
      unit_number: u.unit_number,
      status:      u.status,
      rent_amount: u.rent_amount,
    })),
  }
}

function toPayment(p, i) {
  const propName   = p.properties?.name || p.leases?.units?.properties?.name || '—'
  const statusMap  = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue' }
  return {
    id:     p.id,
    ref:    `TXN-${2600 + i + 1}`,
    prop:   propName,
    tenant: p.tenant_name || p.profiles?.full_name || p.profiles?.email || 'Tenant',
    amount: Number(p.amount),
    date:   p.due_date ? fmtDate(p.due_date) : '—',
    method: p.payment_method || '—',
    status: statusMap[p.status] || 'Pending',
  }
}

function toMaintenance(m, i) {
  const pm = { high: 'High', medium: 'Medium', low: 'Low' }
  const sm = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }
  return {
    id:       m.id,
    ref:      `MNT-${String(40 + i + 1).padStart(4, '0')}`,
    prop:     m.units?.properties?.name || '—',
    issue:    m.issue,
    priority: pm[m.priority] || 'Medium',
    status:   sm[m.status]   || 'Open',
    date:     m.created_at ? fmtDate(m.created_at) : '—',
    assignee: m.assignee || 'Unassigned',
  }
}

function buildRevenueMonths(ownerPayments) {
  const paid = ownerPayments.filter(p => p.status === 'paid')
  if (!paid.length) return null
  const byMonth = {}
  paid.forEach(p => {
    const d = new Date(p.paid_date || p.due_date)
    if (isNaN(d.getTime())) return
    const key   = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    if (!byMonth[key]) byMonth[key] = { month: label, value: 0 }
    byMonth[key].value += Number(p.amount)
  })
  const months = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .slice(-6)
  return months.length >= 2 ? months : null
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }) {
  const { profile } = useAuth()
  const [properties,    setProperties]    = useState([])
  const [payments,      setPayments]      = useState([])
  const [maintenance,   setMaintenance]   = useState([])
  const [tenants,       setTenants]       = useState([])
  const [revenueMonths, setRevenueMonths] = useState(FALLBACK_REVENUE)
  const [loading,       setLoading]       = useState(true)

  const refresh = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return }
    setLoading(true)
    try {
      // Each query is independent — a policy error on one table won't crash the rest
      const [propRes, payRes, maintRes, leasesRes] = await Promise.allSettled([
        supabase
          .from('properties')
          .select('*, units(id, unit_number, status, rent_amount)')
          .eq('owner_id', profile.id)
          .order('created_at'),

        supabase
          .from('payments')
          .select(`
            *,
            profiles:tenant_id(full_name, email),
            properties(id, name, owner_id),
            leases(unit_id, units(property_id, properties(id, name, owner_id)))
          `)
          .order('due_date', { ascending: false })
          .limit(200),

        supabase
          .from('maintenance_requests')
          .select('*, units(property_id, properties(id, name, owner_id))')
          .order('created_at', { ascending: false })
          .limit(200),

        supabase
          .from('leases')
          .select(`
            id, status, start_date, end_date, monthly_rent, access_code, notes, created_at,
            profiles:tenant_id(id, full_name, email),
            units(id, unit_number, properties(id, name, owner_id))
          `)
          .order('created_at', { ascending: false })
          .limit(500),
      ])

      // allSettled: each result is { status:'fulfilled', value } or { status:'rejected', reason }
      const propData   = propRes.status   === 'fulfilled' ? propRes.value.data   : null
      const payData    = payRes.status    === 'fulfilled' ? payRes.value.data    : null
      const maintData  = maintRes.status  === 'fulfilled' ? maintRes.value.data  : null
      const leasesData = leasesRes.status === 'fulfilled' ? leasesRes.value.data : null

      if (propRes.status   === 'rejected') console.warn('properties fetch failed:', propRes.reason)
      if (payRes.status    === 'rejected') console.warn('payments fetch failed:',   payRes.reason)
      if (maintRes.status  === 'rejected') console.warn('maintenance fetch failed:',maintRes.reason)
      if (leasesRes.status === 'rejected') console.warn('leases fetch failed:',     leasesRes.reason)

      if (propData) setProperties(propData.map(toProperty))

      if (payData) {
        const mine = payData.filter(p =>
          p.properties?.owner_id === profile.id ||
          p.leases?.units?.properties?.owner_id === profile.id
        )
        setPayments(mine.map((p, i) => toPayment(p, i)))
        const rev = buildRevenueMonths(mine)
        if (rev) setRevenueMonths(rev)
      }

      if (maintData) {
        const mine = maintData.filter(m =>
          m.units?.properties?.owner_id === profile.id
        )
        setMaintenance(mine.map((m, i) => toMaintenance(m, i)))
      }

      if (leasesData) {
        const mine = leasesData.filter(l =>
          l.units?.properties?.owner_id === profile.id
        )
        setTenants(mine.map(toLease))
      }
    } catch (e) {
      console.error('DataContext fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => { refresh() }, [refresh])

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const addProperty = useCallback(async (form) => {
    if (!profile?.id) throw new Error('Session not ready — please refresh the page.')
    const words = form.name.trim().split(/\s+/)
    const code  = form.code ||
      words.slice(0, 2).map(w => w[0].toUpperCase()).join('') + '-' + Date.now().toString().slice(-3)

    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id:      profile.id,
        name:          form.name.trim(),
        code,
        type:          form.type,
        city:          form.city.trim(),
        address:       form.address?.trim() || '',
        floors:        Number(form.floors) || 1,
        sqft:          form.sqft      ? Number(form.sqft)      : null,
        parking_spots: Number(form.parkingSpots) || 0,
        year_built:    form.yearBuilt ? Number(form.yearBuilt) : null,
      })
      .select()
      .single()
    if (error) throw error

    if (form.unitNumber || form.rentAmount) {
      await supabase.from('units').insert({
        property_id: data.id,
        unit_number: form.unitNumber || 'Unit 1',
        rent_amount: Number(form.rentAmount) || 0,
        floor:       1,
        status:      'vacant',
      })
    }

    await refresh()
    return data
  }, [profile?.id, refresh])

  const addUnit = useCallback(async (form) => {
    if (!profile?.id) throw new Error('Session not ready — please refresh the page.')
    const { error } = await supabase.from('units').insert({
      property_id: form.propertyId,
      unit_number: form.unitNumber.trim(),
      floor:       Number(form.floor) || 1,
      sqft:        form.sqft ? Number(form.sqft) : null,
      rent_amount: Number(form.rentAmount) || 0,
      status:      'vacant',
    })
    if (error) throw error
    await refresh()
  }, [refresh])

  const addLease = useCallback(async (form) => {
    if (!profile?.id) throw new Error('Session not ready — please refresh the page.')

    // Resolve unit ID — if not provided, look up by unit number or create it
    let unitId = form.unitId
    if (!unitId && form.unitNumber && form.propertyId) {
      const { data: existing } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', form.propertyId)
        .ilike('unit_number', form.unitNumber.trim())
        .maybeSingle()

      if (existing?.id) {
        unitId = existing.id
      } else {
        const { data: created, error: createErr } = await supabase
          .from('units')
          .insert({ property_id: form.propertyId, unit_number: form.unitNumber.trim(), status: 'vacant', rent_amount: Number(form.monthlyRent) || 0, floor: 1 })
          .select('id')
          .single()
        if (createErr) throw new Error(`Could not create unit: ${createErr.message}`)
        unitId = created.id
      }
    }
    if (!unitId) throw new Error('Unit is required.')

    const code = generateAccessCode()
    const rawCode = code.replace(/-/g, '')
    const syntheticEmail = `${rawCode.toLowerCase()}@augmentics-tenants.com`

    // Create a separate client (persistSession:false) so owner's session is unaffected
    const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({
      email:    syntheticEmail,
      password: rawCode,
      options:  { data: { full_name: form.tenantName.trim(), role: 'tenant' } },
    })

    if (signUpErr && !signUpErr.message?.toLowerCase().includes('already registered')) {
      throw new Error(`Could not create tenant account: ${signUpErr.message}`)
    }

    const tenantId = signUpData?.user?.id
    if (tenantId) {
      // Use the same temp client (as the tenant's own session) to write their profile.
      // This satisfies RLS: auth.uid() === tenantId during this call.
      await tempClient.from('profiles').upsert({
        id:        tenantId,
        email:     syntheticEmail,
        full_name: form.tenantName.trim(),
        role:      'tenant',
      }, { onConflict: 'id' })
    }

    // Create the lease FIRST (access_code stored for tenant login).
    // Embed the tenant's display name in `notes` as a fallback in case the
    // profile join returns null (e.g. when email confirmation blocks the
    // profile upsert above).
    const noteParts = []
    noteParts.push(`Tenant: ${form.tenantName.trim()}`)
    if (form.notes?.trim()) noteParts.push(form.notes.trim())
    const { error } = await supabase.from('leases').insert({
      unit_id:      unitId,
      tenant_id:    tenantId || null,
      monthly_rent: Number(form.monthlyRent),
      start_date:   form.startDate,
      end_date:     form.endDate,
      status:       'active',
      notes:        noteParts.join(' | '),
      access_code:  code,
    })
    if (error) throw error

    // Only mark the unit occupied AFTER the lease insert succeeds —
    // prevents orphan "occupied" units when the lease creation fails.
    await supabase.from('units')
      .update({ status: 'occupied', rent_amount: Number(form.monthlyRent) })
      .eq('id', unitId)

    await refresh()
    return { code }
  }, [refresh])

  const addPayment = useCallback(async (form) => {
    const { error } = await supabase.from('payments').insert({
      property_id:    form.propertyId || null,
      lease_id:       null,
      tenant_id:      null,
      tenant_name:    form.tenantName.trim(),
      amount:         Number(form.amount),
      due_date:       form.dueDate,
      paid_date:      form.paidDate  || null,
      status:         form.status,
      payment_method: form.method    || null,
      notes:          form.notes?.trim() || null,
    })
    if (error) throw error
    await refresh()
  }, [profile?.id, refresh])

  return (
    <Ctx.Provider value={{
      properties, payments, maintenance, tenants, revenueMonths,
      loading, refresh, addProperty, addUnit, addLease, addPayment,
    }}>
      {children}
    </Ctx.Provider>
  )
}
