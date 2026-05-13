// Augmentics AI — Real Estate Intelligence logo
// Uses the official PNG at public/augmentics-logo.png (blue triangular mark
// on transparent background, works on both light and dark surfaces).

const LOGO_SRC = `${import.meta.env.BASE_URL}augmentics-logo.png`
const ACCENT = '#1F6BFF'

export function AugmenticsLogoMark({ size = 40, onDark = true }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Augmentics AI"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  )
}

export function AugmenticsLogoBrand({ size = 40, onDark = true }) {
  const textColor = onDark ? '#F4F7FC' : '#0B1220'
  const subColor  = onDark ? '#9AA6BD' : '#5B6577'
  const markBg = onDark
    ? 'linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,0))'
    : 'linear-gradient(180deg,#F6F8FA,#FFFFFF)'
  const markBorder = onDark ? 'rgba(255,255,255,.08)' : '#E6E9EE'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: size, height: size,
        display: 'grid', placeItems: 'center',
        border: `1px solid ${markBorder}`,
        background: markBg,
        borderRadius: Math.round(size * 0.25),
      }}>
        <AugmenticsLogoMark size={Math.round(size * 0.65)} onDark={onDark} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div style={{
          fontSize: Math.round(size * 0.4),
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: textColor,
        }}>
          Augmentics<em style={{ fontStyle: 'normal', color: ACCENT }}> AI</em>
        </div>
        <div style={{
          fontSize: Math.round(size * 0.26),
          letterSpacing: '0.22em',
          color: subColor,
          marginTop: 6,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Real Estate Intelligence
        </div>
      </div>
    </div>
  )
}

// Legacy aliases
export const LeadlinkLogoMark  = AugmenticsLogoMark
export const LeadlinkLogoBrand = AugmenticsLogoBrand
