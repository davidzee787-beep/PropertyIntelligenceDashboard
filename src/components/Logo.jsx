// Leadlink Solutions logo
// Drop your actual logo file at: public/leadlink-logo.png (or .svg)
// It will be served at /leadlink-logo.png and rendered pixel-perfect at any size.

// Prefix with BASE_URL so the path works in dev (`/`) and on GitHub Pages
// (`/PropertyIntelligenceDashboard/`).
const LOGO_SRC = `${import.meta.env.BASE_URL}leadlink-logo.png`

export function LeadlinkLogoMark({ size = 40, onDark = true }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Leadlink Solutions"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  )
}

export function LeadlinkLogoBrand({ size = 40, onDark = true }) {
  const textColor = onDark ? '#F1F5F9' : '#0D1117'
  const subColor  = onDark ? '#64748B' : '#6B7280'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LeadlinkLogoMark size={size} onDark={onDark} />
      <div>
        <div style={{ fontSize: Math.round(size * 0.325), fontWeight: 700, color: textColor, letterSpacing: '0.4px', fontFamily: "'Syne', sans-serif", lineHeight: 1.1 }}>
          LEADLINK <span style={{ color: '#2B96D4' }}>SOLUTIONS</span>
        </div>
        <div style={{ fontSize: Math.round(size * 0.225), color: subColor, letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
          Property Management
        </div>
      </div>
    </div>
  )
}

// Legacy aliases — keep imports working across all files
export const AugmenticsLogoMark  = LeadlinkLogoMark
export const AugmenticsLogoBrand = LeadlinkLogoBrand
