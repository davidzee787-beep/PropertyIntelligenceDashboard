// Augmentics AI — Real Estate Intelligence logo
//
// The logo is rendered as inline SVG so it adapts to both dark and light
// themes automatically (via the `onDark` prop) without needing two separate
// image files. If you'd rather use your own PNG, drop it at
// `public/augmentics-logo.png` and swap the <svg> below for an <img> tag.

const ACCENT = '#2B96D4'

export function AugmenticsLogoMark({ size = 40, onDark = true }) {
  const stroke = onDark ? '#F1F5F9' : '#0D1117'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-label="Augmentics AI"
    >
      {/* Outer triangle outline */}
      <path
        d="M 50 8 L 92 90 L 8 90 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="4.5"
        strokeLinejoin="miter"
      />
      {/* Inner triangle outline */}
      <path
        d="M 50 28 L 78 82 L 22 82 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="miter"
      />
      {/* Innermost solid blue triangle */}
      <path
        d="M 50 44 L 70 76 L 30 76 Z"
        fill={ACCENT}
      />
    </svg>
  )
}

export function AugmenticsLogoBrand({ size = 40, onDark = true }) {
  const textColor = onDark ? '#F1F5F9' : '#0D1117'
  const subColor  = onDark ? '#64748B' : '#6B7280'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <AugmenticsLogoMark size={size} onDark={onDark} />
      <div>
        <div style={{
          fontSize: Math.round(size * 0.34),
          fontWeight: 800,
          color: textColor,
          letterSpacing: '1.2px',
          fontFamily: "'Syne', sans-serif",
          lineHeight: 1.05,
        }}>
          AUGMENTICS <span style={{ color: ACCENT }}>AI</span>
        </div>
        <div style={{
          fontSize: Math.round(size * 0.22),
          color: subColor,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          marginTop: 3,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
        }}>
          Real Estate Intelligence
        </div>
      </div>
    </div>
  )
}

// Legacy aliases — keep older imports working
export const LeadlinkLogoMark  = AugmenticsLogoMark
export const LeadlinkLogoBrand = AugmenticsLogoBrand
