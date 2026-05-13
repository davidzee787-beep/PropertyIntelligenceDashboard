import { createContext, useContext, useState, useEffect } from 'react'

export const GCC = [
  { id: 'KW', country: 'Kuwait',       cities: 'Kuwait City · Hawalli · Salmiya', currency: 'KWD', flag: '🇰🇼' },
  { id: 'AE', country: 'UAE',          cities: 'Dubai · Abu Dhabi · Sharjah',     currency: 'AED', flag: '🇦🇪' },
  { id: 'SA', country: 'Saudi Arabia', cities: 'Riyadh · Jeddah · Dammam',        currency: 'SAR', flag: '🇸🇦' },
  { id: 'BH', country: 'Bahrain',      cities: 'Manama · Riffa',                  currency: 'BHD', flag: '🇧🇭' },
  { id: 'QA', country: 'Qatar',        cities: 'Doha · Al Rayyan',                currency: 'QAR', flag: '🇶🇦' },
  { id: 'OM', country: 'Oman',         cities: 'Muscat · Salalah',                currency: 'OMR', flag: '🇴🇲' },
]

const STORAGE_KEY = 'aug_region'
const DEFAULT_REGION = GCC.find(r => r.id === 'KW') || GCC[0]

function loadRegion() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return GCC.find(r => r.id === saved?.id) || DEFAULT_REGION
  } catch { return DEFAULT_REGION }
}

const Ctx = createContext(null)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const [region, _setRegion] = useState(loadRegion)

  useEffect(() => {
    // Ensure localStorage is always in sync on first load
    localStorage.setItem('aug_currency', region.currency)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setRegion = r => {
    _setRegion(r)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
    localStorage.setItem('aug_currency', r.currency)
  }

  const fmtCurrency = n => `${region.currency} ${Number(n || 0).toLocaleString()}`

  return (
    <Ctx.Provider value={{ region, setRegion, fmtCurrency, GCC }}>
      {children}
    </Ctx.Provider>
  )
}
