import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { DataProvider, useAppData } from "../context/DataContext.jsx";
import { useSettings, GCC } from "../context/SettingsContext.jsx";
import { supabase } from "../lib/supabase.js";
import { AugmenticsLogoMark } from "../components/Logo.jsx";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

// ─── Design tokens ────────────────────────────────────────────────────────────
const DARK = {
  bg:        "#080C18", white:     "#0D1829",
  sidebar:   "#060A14", sideHov:   "#0F1C38", sideActive:"#1B5FD8",
  blue:      "#1B5FD8", blueDk:    "#1249B0", blueLt:    "#3B7EF6",
  bluePl:    "rgba(59,126,246,0.12)", blueAlpha: "rgba(27,95,216,0.15)",
  t1:        "#F1F5F9", t2:        "#94A3B8", t3:        "#64748B", t4: "#334155",
  border:    "#1A2D4A", borderMd:  "#243650",
  green:     "#10B981", greenDk:   "#059669",
  greenPl:   "rgba(16,185,129,0.12)", greenAlpha:"rgba(16,185,129,0.12)",
  amber:     "#F59E0B", amberPl:   "rgba(245,158,11,0.12)", amberAlpha:"rgba(245,158,11,0.12)",
  red:       "#EF4444", redPl:     "rgba(239,68,68,0.12)",  redAlpha:  "rgba(239,68,68,0.12)",
  sideT1:    "#F1F5F9", sideT2:    "#64748B", sideT3: "#1E3A5F",
  inputBg:   "#060A14",
};
const LIGHT = {
  bg:        "#F0F4F8", white:     "#FFFFFF",
  sidebar:   "#060A14", sideHov:   "#0F1C38", sideActive:"#1B5FD8",
  blue:      "#1B5FD8", blueDk:    "#1249B0", blueLt:    "#3B7EF6",
  bluePl:    "rgba(59,126,246,0.10)", blueAlpha: "rgba(27,95,216,0.10)",
  t1:        "#0D1117", t2:        "#374151", t3:        "#6B7280", t4: "#9CA3AF",
  border:    "#E5E7EB", borderMd:  "#D1D5DB",
  green:     "#059669", greenDk:   "#047857",
  greenPl:   "rgba(5,150,105,0.10)",  greenAlpha:"rgba(5,150,105,0.10)",
  amber:     "#D97706", amberPl:   "rgba(217,119,6,0.10)",  amberAlpha:"rgba(217,119,6,0.10)",
  red:       "#DC2626", redPl:     "rgba(220,38,38,0.10)",  redAlpha:  "rgba(220,38,38,0.10)",
  sideT1:    "#F1F5F9", sideT2:    "#64748B", sideT3: "#1E3A5F",
  inputBg:   "#F9FAFB",
};
const ThemeCtx = createContext(DARK);
const useC = () => useContext(ThemeCtx);

const fmt    = n => Number(n || 0).toLocaleString();
const fmtAED = n => `${localStorage.getItem('aug_currency') || 'AED'} ${Number(n || 0).toLocaleString()}`;

// ─── Tiny SVG icon set ────────────────────────────────────────────────────────
const Icon = {
  grid:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  building:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4"/></svg>,
  payment: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  wrench:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  bot:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 14v2M16 14v2"/></svg>,
  user:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  tenants: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  copy:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  checkCircle: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  settings:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  globe:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  pencil:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  send:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  trending:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  x:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevDown:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  home:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  mapPin:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  calendar:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  sun:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function Badge({ s }) {
  const C = useC();
  const map = {
    Active:       { bg: C.greenAlpha,  color: C.green   },
    Paid:         { bg: C.greenAlpha,  color: C.green   },
    Resolved:     { bg: C.greenAlpha,  color: C.green   },
    "In Progress":{ bg: C.blueAlpha,   color: C.blueLt  },
    Pending:      { bg: C.amberAlpha,  color: C.amber   },
    Medium:       { bg: C.amberAlpha,  color: C.amber   },
    Expiring:     { bg: C.redAlpha,    color: C.red     },
    Overdue:      { bg: C.redAlpha,    color: C.red     },
    Open:         { bg: C.redAlpha,    color: C.red     },
    High:         { bg: C.redAlpha,    color: C.red     },
    Low:          { bg: C.blueAlpha,   color: C.t2      },
  };
  const { bg, color } = map[s] || map.Low;
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 20, letterSpacing: "0.2px",
      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {(s === "Active" || s === "Paid") && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
      )}
      {s}
    </span>
  );
}

// ─── Occupancy bar ────────────────────────────────────────────────────────────
function OccBar({ pct }) {
  const C = useC();
  const color = pct >= 80 ? C.green : pct >= 70 ? C.amber : C.red;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.t3 }}>Occupancy</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

// ─── Mini sparkline bar chart ─────────────────────────────────────────────────
function SparkBars({ data }) {
  const C = useC();
  const max = Math.max(...data.map(d => d.value));
  const w = 220, h = 52, barW = 24, gap = 8;
  const total = data.length * barW + (data.length - 1) * gap;
  const startX = (w - total) / 2;
  return (
    <svg width={w} height={h + 18} viewBox={`0 0 ${w} ${h + 18}`}>
      {data.map((d, i) => {
        const barH = Math.round((d.value / max) * h);
        const x = startX + i * (barW + gap);
        const y = h - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3}
              fill={isLast ? C.blue : C.blueAlpha}
              style={{ transition: "height 0.8s ease, y 0.8s ease" }}
            />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle"
              style={{ fontSize: 9, fill: C.t4, fontFamily: "Inter, sans-serif", fontWeight: isLast ? 700 : 400 }}>
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Line chart ───────────────────────────────────────────────────────────
function LineChart({ data, color = DARK.blue, height = 60, width = 200 }) {
  const C = useC();
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pad = 4;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (width - pad * 2));
  const ys = vals.map(v => height - pad - ((v - min) / range) * (height - pad * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${height} L${xs[0]},${height} Z`;
  const id = `lg-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill={color} />
    </svg>
  );
}

// ─── SVG Donut chart ──────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 22 }) {
  const C = useC();
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={thickness} />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ─── Ring progress ────────────────────────────────────────────────────────────
function RingProgress({ pct, size = 52, color = DARK.blue, thickness = 6 }) {
  const C = useC();
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={thickness} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Mini sparkline (inline, no labels) ──────────────────────────────────────
function Sparkline({ data, color = DARK.blue }) {
  const C = useC();
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const w = 80, h = 28;
  const xs = vals.map((_, i) => (i / (vals.length - 1)) * w);
  const ys = vals.map(v => h - ((v - min) / range) * h);
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon, accent, onClick, sparkData, ring }) {
  const C = useC();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: C.white, borderRadius: 14,
        border: `1px solid ${hov ? accent + "60" : C.border}`,
        padding: "18px 20px", cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        boxShadow: hov ? `0 4px 24px rgba(0,0,0,0.3)` : "0 1px 3px rgba(0,0,0,0.2)",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</span>
        {ring != null
          ? <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RingProgress pct={ring} size={44} color={accent} thickness={5} />
              <span style={{ position: "absolute", fontSize: 11, fontWeight: 800, color: accent }}>{ring}%</span>
            </div>
          : <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>{icon}</div>
        }
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, letterSpacing: "-0.5px", fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {sub && <div style={{ fontSize: 11, color: C.t3 }}>{sub}</div>}
        {sparkData && <Sparkline data={sparkData} color={accent} />}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, right }) {
  const C = useC();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{title}</span>
        {count != null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1px 7px" }}>{count}</span>
        )}
      </div>
      {right}
    </div>
  );
}

function TH({ children }) {
  const C = useC();
  return <span style={{ fontSize: 10, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.8px" }}>{children}</span>;
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  const C = useC();
  const { isMobile } = useBreakpoint();
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(4,7,20,0.80)",
      display: "flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: isMobile ? 0 : 24,
      backdropFilter: "blur(4px)",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.white,
        borderRadius: isMobile ? "16px 16px 0 0" : 16,
        border: `1px solid ${C.border}`,
        width: "100%", maxWidth: wide ? 660 : 520,
        boxShadow: isMobile ? "0 -8px 40px rgba(0,0,0,0.5)" : "0 32px 80px rgba(0,0,0,0.6)",
        maxHeight: isMobile ? "90vh" : "92vh",
        overflowY: "auto",
        animation: "fadeIn 0.15s ease",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.t3 }}>{Icon.x}</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
const makeInputSt = C => ({
  width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "9px 12px", fontSize: 13, color: C.t1, outline: "none",
  fontFamily: "inherit", background: C.inputBg, boxSizing: "border-box",
});
const makeLabelSt = C => ({ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" });

function Field({ label, children }) {
  const C = useC();
  const labelSt = makeLabelSt(C);
  return (
    <div>
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}

function SubmitRow({ onClose, loading, label = "Save" }) {
  const C = useC();
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
      <button type="button" onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.t2, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
      <button type="submit" disabled={loading} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: loading ? C.border : C.blue, fontSize: 13, fontWeight: 600, color: loading ? C.t3 : "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>{loading ? "Saving…" : label}</button>
    </div>
  );
}

// ─── Add Property Modal ───────────────────────────────────────────────────────
function AddPropertyModal({ onClose, onSaved }) {
  const C = useC();
  const inputSt = makeInputSt(C);
  const { addProperty } = useAppData();
  const [form, setForm] = useState({ name: "", code: "", type: "Residential", city: "", address: "", floors: "1", sqft: "", parkingSpots: "", yearBuilt: "", unitNumber: "", rentAmount: "" });
  const [busy, setBusy]   = useState(false);
  const [err,  setErr]    = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) { setErr("Name and city are required."); return; }
    setBusy(true); setErr("");
    try {
      await addProperty(form);
      onSaved?.();
      onClose();
    } catch (ex) {
      setErr(ex.message || "Failed to save. Check your inputs.");
    } finally { setBusy(false); }
  };

  const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
  const sel = { ...inputSt, appearance: "none" };

  return (
    <Modal title="Add Property" onClose={onClose} wide>
      <form onSubmit={submit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <Field label="Property Name *">
            <input style={inputSt} value={form.name} onChange={set("name")} placeholder="e.g. Greenfield Residences" required />
          </Field>

          <div style={g2}>
            <Field label="Property Code">
              <input style={inputSt} value={form.code} onChange={set("code")} placeholder="Auto-generated if blank" />
            </Field>
            <Field label="Type *">
              <select style={sel} value={form.type} onChange={set("type")}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </Field>
          </div>

          <div style={g2}>
            <Field label="City *">
              <input style={inputSt} value={form.city} onChange={set("city")} placeholder="e.g. Dubai Hills" required />
            </Field>
            <Field label="Year Built">
              <input style={inputSt} type="number" value={form.yearBuilt} onChange={set("yearBuilt")} placeholder="e.g. 2018" min="1900" max="2100" />
            </Field>
          </div>

          <Field label="Address">
            <input style={inputSt} value={form.address} onChange={set("address")} placeholder="Full address" />
          </Field>

          <div style={g2}>
            <Field label="Total Area (sqft)">
              <input style={inputSt} type="number" value={form.sqft} onChange={set("sqft")} placeholder="e.g. 4200" min="0" />
            </Field>
            <Field label="Floors">
              <input style={inputSt} type="number" value={form.floors} onChange={set("floors")} placeholder="1" min="1" />
            </Field>
          </div>

          <Field label="Parking Spots">
            <input style={inputSt} type="number" value={form.parkingSpots} onChange={set("parkingSpots")} placeholder="0" min="0" />
          </Field>

          {/* First unit */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>First Unit (optional)</div>
            <div style={g2}>
              <Field label="Unit Number">
                <input style={inputSt} value={form.unitNumber} onChange={set("unitNumber")} placeholder="e.g. Unit 1, 101" />
              </Field>
              <Field label="Monthly Rent (AED)">
                <input style={inputSt} type="number" value={form.rentAmount} onChange={set("rentAmount")} placeholder="e.g. 12000" min="0" />
              </Field>
            </div>
          </div>

          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px" }}>{err}</div>}

          <SubmitRow onClose={onClose} loading={busy} label="Add Property" />
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Unit Modal ───────────────────────────────────────────────────────────
function AddUnitModal({ property, onClose }) {
  const C = useC();
  const inputSt = makeInputSt(C);
  const { addUnit } = useAppData();
  const [form, setForm] = useState({ unitNumber: "", floor: "1", sqft: "", rentAmount: "" });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.unitNumber.trim()) { setErr("Unit number is required."); return; }
    setBusy(true); setErr("");
    try {
      await addUnit({ propertyId: property.id, ...form });
      onClose();
    } catch (ex) {
      setErr(ex.message || "Failed to save.");
    } finally { setBusy(false); }
  };

  const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

  return (
    <Modal title={`Add Unit — ${property.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Unit Number *">
            <input style={inputSt} value={form.unitNumber} onChange={set("unitNumber")} placeholder="e.g. 101, Unit A, Shop 3" required />
          </Field>
          <div style={g2}>
            <Field label="Floor">
              <input style={inputSt} type="number" value={form.floor} onChange={set("floor")} min="1" />
            </Field>
            <Field label="Area (sqft)">
              <input style={inputSt} type="number" value={form.sqft} onChange={set("sqft")} placeholder="Optional" min="0" />
            </Field>
          </div>
          <Field label="Monthly Rent (AED)">
            <input style={inputSt} type="number" value={form.rentAmount} onChange={set("rentAmount")} placeholder="e.g. 12000" min="0" />
          </Field>
          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px" }}>{err}</div>}
          <SubmitRow onClose={onClose} loading={busy} label="Add Unit" />
        </div>
      </form>
    </Modal>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
function RecordPaymentModal({ properties, onClose }) {
  const C = useC();
  const inputSt = makeInputSt(C);
  const { addPayment } = useAppData();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    propertyId: properties[0]?.id || "",
    tenantName: "", amount: "", dueDate: today, paidDate: "",
    status: "paid", method: "Bank Transfer", notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.tenantName.trim() || !form.amount || !form.dueDate) { setErr("Tenant name, amount, and due date are required."); return; }
    setBusy(true); setErr("");
    try {
      await addPayment(form);
      onClose();
    } catch (ex) {
      setErr(ex.message || "Failed to save.");
    } finally { setBusy(false); }
  };

  const g2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
  const sel = { ...inputSt, appearance: "none" };

  return (
    <Modal title="Record Payment" onClose={onClose} wide>
      <form onSubmit={submit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <Field label="Property">
            <select style={sel} value={form.propertyId} onChange={set("propertyId")}>
              {properties.length === 0
                ? <option value="">— No properties yet —</option>
                : properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
              }
            </select>
          </Field>

          <Field label="Tenant / Payer Name *">
            <input style={inputSt} value={form.tenantName} onChange={set("tenantName")} placeholder="e.g. Al Fardan Family" required />
          </Field>

          <div style={g2}>
            <Field label="Amount (AED) *">
              <input style={inputSt} type="number" value={form.amount} onChange={set("amount")} placeholder="e.g. 12000" min="0" required />
            </Field>
            <Field label="Payment Method">
              <select style={sel} value={form.method} onChange={set("method")}>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Online Payment</option>
                <option>Cash</option>
              </select>
            </Field>
          </div>

          <div style={g2}>
            <Field label="Due Date *">
              <input style={inputSt} type="date" value={form.dueDate} onChange={set("dueDate")} required />
            </Field>
            <Field label="Paid Date">
              <input style={inputSt} type="date" value={form.paidDate} onChange={set("paidDate")} />
            </Field>
          </div>

          <Field label="Status">
            <select style={sel} value={form.status} onChange={set("status")}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </Field>

          <Field label="Notes">
            <input style={inputSt} value={form.notes} onChange={set("notes")} placeholder="Optional note…" />
          </Field>

          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px" }}>{err}</div>}

          <SubmitRow onClose={onClose} loading={busy} label="Record Payment" />
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Lease Modal ──────────────────────────────────────────────────────────
function AddLeaseModal({ property, onClose }) {
  const C = useC();
  const inputSt = makeInputSt(C);
  const { addLease } = useAppData();
  const today   = new Date().toISOString().split('T')[0];
  const oneYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

  // Fetch units fresh from DB so this works even when the cached property._units is empty
  const [units,        setUnits]        = useState(property._units || []);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    setLoadingUnits(true);
    supabase
      .from('units')
      .select('id, unit_number, status, rent_amount')
      .eq('property_id', property.id)
      .then(({ data }) => {
        if (data && data.length > 0) setUnits(data);
        setLoadingUnits(false);
      });
  }, [property.id]);

  const allUnits    = units;
  const useDropdown = allUnits.length > 0;

  const [form, setForm] = useState({
    unitId:      '',
    unitNumber:  '',       // manual entry fallback
    tenantName:  '',
    monthlyRent: '',
    startDate:   today,
    endDate:     oneYear,
    notes:       '',
  });
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState('');
  const [doneCode, setDoneCode] = useState(null);
  const [copied,   setCopied]   = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const g2  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };

  // When units load and dropdown is available, pre-select first vacant unit
  useEffect(() => {
    const firstVacant = allUnits.find(u => u.status === 'vacant') || allUnits[0];
    if (firstVacant && !form.unitId) {
      setForm(f => ({ ...f, unitId: firstVacant.id, monthlyRent: firstVacant.rent_amount || f.monthlyRent }));
    }
  }, [units]);

  const submit = async e => {
    e.preventDefault();
    const hasUnit = useDropdown ? !!form.unitId : !!form.unitNumber.trim();
    if (!hasUnit)                { setErr('Unit is required.'); return; }
    if (!form.tenantName.trim()) { setErr('Tenant name is required.'); return; }
    if (!form.monthlyRent || !form.startDate || !form.endDate) {
      setErr('Rent, start date, and end date are required.'); return;
    }
    setBusy(true); setErr('');
    try {
      const payload = {
        ...form,
        propertyId: property.id,
        // If no unitId (manual entry), pass unitNumber so addLease can look up / create
        unitId:     form.unitId || null,
        unitNumber: form.unitNumber.trim() || null,
      };
      const { code } = await addLease(payload);
      setDoneCode(code);
    } catch (ex) {
      setErr(ex.message || 'Failed to create lease.');
    } finally { setBusy(false); }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(doneCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (doneCode) return (
    <Modal title="Lease Created" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.greenAlpha, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✅</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 4 }}>Lease created for {form.tenantName}</div>
          <div style={{ fontSize: 13, color: C.t3 }}>Share this access code with your tenant</div>
        </div>
        <div style={{ width: '100%', background: C.bg, border: `2px dashed ${C.blue}`, borderRadius: 12, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Tenant Access Code</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.blue, letterSpacing: '6px', fontFamily: "'Syne', sans-serif" }}>{doneCode}</div>
        </div>
        <div style={{ width: '100%', background: C.amberAlpha, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: '12px 14px', fontSize: 12, color: C.t2, lineHeight: 1.7 }}>
          <strong>Save this code now</strong> — it won't be shown again.<br />
          Tenant goes to <strong style={{ color: C.blue }}>/tenant-login</strong> and enters this code.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={copyCode} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${C.blue}`, background: copied ? C.greenAlpha : C.bluePl, color: copied ? C.greenDk : C.blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <Modal title={`Add Lease — ${property.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.bluePl, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: C.blue, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="8" cy="8" r="7"/><line x1="21" y1="21" x2="14.35" y2="14.35"/></svg>
            A unique access code will be generated — share it with the tenant to log in.
          </div>

          {/* Unit — dropdown when loaded, text input when not */}
          <Field label="Unit *">
            {loadingUnits ? (
              <div style={{ ...inputSt, color: C.t3, display: 'flex', alignItems: 'center' }}>Loading units…</div>
            ) : useDropdown ? (
              <select style={{ ...inputSt, appearance: 'none' }} value={form.unitId} onChange={e => {
                const unit = allUnits.find(u => u.id === e.target.value);
                setForm(f => ({ ...f, unitId: e.target.value, monthlyRent: unit?.rent_amount || f.monthlyRent }));
              }}>
                <option value="">— Select unit —</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number}{u.status === 'occupied' ? ' (occupied)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input style={inputSt} value={form.unitNumber} onChange={set('unitNumber')}
                placeholder="e.g. Unit 1, 101, Shop A" />
            )}
            {!loadingUnits && !useDropdown && (
              <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
                Type the unit number (or add units via Properties tab first)
              </div>
            )}
          </Field>

          <Field label="Tenant Name *">
            <input style={inputSt} value={form.tenantName} onChange={set('tenantName')} placeholder="e.g. Mohammed Al-Rashid" required />
          </Field>
          <Field label="Monthly Rent *">
            <input style={inputSt} type="number" value={form.monthlyRent} onChange={set('monthlyRent')} placeholder="12000" min="0" required />
          </Field>
          <div style={g2}>
            <Field label="Start Date *">
              <input style={inputSt} type="date" value={form.startDate} onChange={set('startDate')} required />
            </Field>
            <Field label="End Date *">
              <input style={inputSt} type="date" value={form.endDate} onChange={set('endDate')} required />
            </Field>
          </div>
          <Field label="Notes">
            <input style={inputSt} value={form.notes} onChange={set('notes')} placeholder="Optional notes…" />
          </Field>
          {err && <div style={{ fontSize: 12, color: C.red, background: C.redAlpha, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px' }}>{err}</div>}
          <SubmitRow onClose={onClose} loading={busy} label="Create Lease & Generate Code" />
        </div>
      </form>
    </Modal>
  );
}

// ─── AI context builder ───────────────────────────────────────────────────────
function buildAICtx(properties, payments, maintenance) {
  const totalRent = properties.reduce((s, p) => s + p.rent, 0);
  const propCount = properties.length;
  const unitCount = properties.reduce((s, p) => s + p.units, 0);
  const avgOcc    = propCount ? Math.round(properties.reduce((s, p) => s + p.occ, 0) / propCount) : 0;
  const collected = payments.filter(t => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const overdueP  = payments.filter(t => t.status === "Overdue");
  const openMaint = maintenance.filter(m => m.status !== "Resolved");
  const highMaint = openMaint.filter(m => m.priority === "High");
  const expiring  = properties.filter(p => p.daysLeft < 120);

  const propList = propCount
    ? properties.map(p => `— ${p.name}: AED ${p.rent.toLocaleString()}/mo`).join("\n")
    : "— No active leases recorded yet. Add a property to get started.";

  return {
    income:  `Your total rental income is **AED ${totalRent.toLocaleString()}**/month.\n\nBreakdown:\n${propList}\n\nCollected this period: **AED ${collected.toLocaleString()}**`,
    expiry:  expiring.length === 0
      ? "No leases expiring in the next 120 days. Portfolio looks healthy."
      : `${expiring.length} lease${expiring.length > 1 ? "s" : ""} need attention:\n\n${expiring.map(p => `— **${p.name}** (${p.code}): expires ${p.expiry}, **${p.daysLeft} days remaining**`).join("\n\n")}\n\nEstimated revenue at risk: **AED ${expiring.reduce((s, p) => s + p.rent, 0).toLocaleString()}/mo**`,
    maint:   openMaint.length === 0
      ? "No open maintenance requests — portfolio is fully clear."
      : `**${openMaint.length} open request${openMaint.length > 1 ? "s" : ""}** — **${highMaint.length} high priority**.\n\n${openMaint.slice(0, 5).map(m => `— ${m.ref}: ${m.issue} at **${m.prop}** (${m.priority})`).join("\n")}`,
    occ:     `Portfolio occupancy: **${avgOcc}% average** across ${unitCount} units.\n\n${properties.length ? properties.map(p => `— ${p.name}: **${p.occ}%**${p.occ === 100 ? " ✓" : p.occ === 0 ? " ⚠ Vacant" : ""}`).join("\n") : "— No properties yet."}`,
    overdue: overdueP.length === 0
      ? "No overdue payments — all tenants are current."
      : `**${overdueP.length} overdue payment${overdueP.length > 1 ? "s" : ""}**:\n\n${overdueP.map(p => `— ${p.ref}: ${p.tenant}, ${p.prop}, **AED ${p.amount.toLocaleString()}** due ${p.date}`).join("\n")}`,
    default: `I have full context on your portfolio — **${propCount} ${propCount === 1 ? "property" : "properties"}**, **${unitCount} units**, **AED ${totalRent.toLocaleString()}/mo** revenue.\n\nAsk me anything:\n— What is my total rental income?\n— Which leases expire soon?\n— Any urgent maintenance?\n— Current occupancy rate?\n— Any overdue payments?`,
  };
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "Overview",    label: "Overview",     icon: Icon.grid    },
  { id: "Properties",  label: "Properties",   icon: Icon.building},
  { id: "Tenants",     label: "Tenants",      icon: Icon.tenants },
  { id: "Payments",    label: "Payments",     icon: Icon.payment },
  { id: "Maintenance", label: "Maintenance",  icon: Icon.wrench  },
  { id: "Assistant",   label: "AI Assistant", icon: Icon.bot     },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, setSel, profileOpen, setProfileOpen, profileRef,
  displayName, initials, signOut, openMaint }) {
  const C = useC();
  return (
    <div style={{
      width: 64, background: C.sidebar, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "0 0 20px", flexShrink: 0, minHeight: "100vh",
      position: "sticky", top: 0, height: "100vh", borderRight: `1px solid ${C.border}`,
      zIndex: 100,
    }}>
      {/* Logo mark */}
      <div style={{ padding: "16px 0 14px", borderBottom: `1px solid ${C.border}`, width: "100%", display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <AugmenticsLogoMark size={30} onDark />
      </div>

      {/* Nav icons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, width: "100%", padding: "0 8px" }}>
        {NAV.map(n => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => { setTab(n.id); setSel(null); }} title={n.label}
              style={{
                width: "100%", height: 44, borderRadius: 10, border: "none",
                background: active ? C.sideActive : "transparent",
                color: active ? "#fff" : C.sideT2,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", position: "relative",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.sideHov; e.currentTarget.style.color = C.sideT1; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.sideT2; } }}
            >
              <span style={{ display: "flex" }}>{n.icon}</span>
              {n.id === "Maintenance" && openMaint > 0 && (
                <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: C.red, border: `2px solid ${C.sidebar}` }} />
              )}
            </button>
          );
        })}
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4 }}>
          {(() => { const active = tab === "Settings"; return (
            <button onClick={() => { setTab("Settings"); setSel(null); }} title="Settings"
              style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: active ? C.sideActive : "transparent", color: active ? "#fff" : C.sideT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.sideHov; e.currentTarget.style.color = C.sideT1; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.sideT2; } }}
            ><span style={{ display: "flex" }}>{Icon.settings}</span></button>
          ); })()}
        </div>
      </div>

      {/* User avatar */}
      <div ref={profileRef} style={{ position: "relative", cursor: "pointer" }} onClick={() => setProfileOpen(p => !p)}>
        <div title={displayName}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1B5FD8,#3B7EF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
          {initials || "AU"}
        </div>
        {profileOpen && (
          <div className="fade-in" style={{ position: "fixed", bottom: 24, left: 72, width: 210, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.45)", zIndex: 9999 }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{displayName}</div>
            </div>
            <button onClick={() => { setTab("Settings"); setProfileOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", background: "none", border: "none", cursor: "pointer", color: C.t2, fontSize: 12, textAlign: "left", fontFamily: "inherit", borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => { e.currentTarget.style.background = C.blueAlpha; e.currentTarget.style.color = C.t1; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.t2; }}
            >{Icon.settings} Settings</button>
            <button onClick={signOut}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 12, textAlign: "left", fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.background = C.redAlpha}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >{Icon.logout} Sign Out</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function Topbar({ tab, notifOpen, setNotifOpen, notifRef, openMaint, theme, toggleTheme, displayName, initials, signOut, profileOpen, setProfileOpen, profileRef }) {
  const C = useC();
  const alerts = openMaint > 0
    ? [{ color: C.red,   text: `${openMaint} open maintenance request${openMaint === 1 ? "" : "s"} need attention`, time: "Now" }]
    : [{ color: C.green, text: "All maintenance requests resolved", time: "Now" }];

  const { isMobile } = useBreakpoint();
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: isMobile ? "0 14px" : "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "relative" }}>
      {/* Left: page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!isMobile && <div style={{ color: C.t2, display: "flex" }}>{Icon.grid}</div>}
        <span style={{ fontSize: isMobile ? 15 : 13, fontWeight: 700, color: C.t1, fontFamily: isMobile ? "'Syne', sans-serif" : "inherit" }}>{tab}</span>
      </div>

      {/* Center: logo (desktop only) */}
      {!isMobile && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
          <AugmenticsLogoMark size={28} onDark={theme === 'dark'} />
          <div style={{ fontSize: 14, fontWeight: 800, color: C.t1, letterSpacing: "1.2px", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
            AUGMENTICS <span style={{ color: C.blue }}>AI</span>
          </div>
        </div>
      )}

      {/* Right: controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div ref={notifRef} style={{ position: "relative" }}>
          <button onClick={() => setNotifOpen(p => !p)}
            style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: notifOpen ? C.blueAlpha : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: notifOpen ? C.blue : C.t2, transition: "all 0.15s", position: "relative" }}>
            {Icon.bell}
            {openMaint > 0 && <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: C.red, border: `2px solid ${C.white}` }} />}
          </button>
          {notifOpen && (
            <div className="fade-in" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", overflow: "hidden", zIndex: 200 }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Notifications</span>
              </div>
              {alerts.map((a, i) => (
                <div key={i} style={{ padding: "11px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.5 }}>{a.text}</div>
                    <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.t2, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; e.currentTarget.style.background = C.blueAlpha; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.t2; e.currentTarget.style.background = "transparent"; }}
        >
          {theme === 'dark' ? Icon.sun : Icon.moon}
        </button>
        {/* Profile avatar — mobile only (sidebar is hidden) */}
        {isMobile && (
          <div ref={profileRef} style={{ position: "relative" }}>
            <div onClick={() => setProfileOpen(p => !p)}
              style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1B5FD8,#3B7EF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.5px", userSelect: "none" }}>
              {initials || "U"}
            </div>
            {profileOpen && (
              <div className="fade-in" style={{ position: "fixed", top: 56, right: 12, width: 210, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.45)", zIndex: 9999 }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Property Manager</div>
                </div>
                <button onClick={() => { setProfileOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", background: "none", border: "none", cursor: "pointer", color: C.t2, fontSize: 12, textAlign: "left", fontFamily: "inherit", borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.blueAlpha; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >{Icon.settings} Settings</button>
                <button onClick={signOut}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 12, textAlign: "left", fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.redAlpha}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >{Icon.logout} Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════════════════════════
function OverviewTab({ setTab, setSel, properties, payments, maintenance, revenueMonths }) {
  const C = useC();
  const { isMobile } = useBreakpoint();
  const totalRent = properties.reduce((s, p) => s + p.rent, 0);
  const avgOcc    = properties.length ? Math.round(properties.reduce((s, p) => s + p.occ, 0) / properties.length) : 0;
  const openMaint = maintenance.filter(m => m.status !== "Resolved").length;
  const expiring  = properties.filter(p => p.daysLeft < 120).length;
  const collected = payments.filter(t => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const pending   = payments.filter(t => t.status === "Pending").reduce((s, t) => s + t.amount, 0);
  const overdue   = payments.filter(t => t.status === "Overdue").reduce((s, t) => s + t.amount, 0);

  const typeColorMap = { Residential: C.blue, Commercial: C.blueLt, Industrial: "#0EA5E9", Villa: "#8B5CF6", Mixed: C.green };
  const typeCounts = properties.reduce((acc, p) => { const t = p.type || "Other"; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const total = properties.length || 1;
  const resTypes = Object.entries(typeCounts).map(([label, count], i) => ({
    label,
    pct: Math.round(count / total * 100),
    color: typeColorMap[label] || ["#0EA5E9","#8B5CF6","#F59E0B","#10B981"][i % 4],
  }));

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="fade-in">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? 14 : 22 }}>
        <div>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif" }}>Dashboard</div>
          {!isMobile && <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>Overview of your property portfolio.</div>}
        </div>
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px" }}>
            <span style={{ color: C.t3, display: "flex" }}>{Icon.calendar}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.t2 }}>{dateStr}</span>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid-kpi">
        <KPICard label="Total Revenue"    value={fmtAED(totalRent)} sub={`+${payments.filter(t => t.status === "Paid").length} payments this period`} icon={Icon.trending} accent={C.blue}  onClick={() => setTab("Payments")} sparkData={revenueMonths} />
        <KPICard label="Occupancy Rate"   value={`${avgOcc}%`}      sub={`+3.6% vs last month`}  accent={C.green} ring={avgOcc} />
        <KPICard label="Total Properties" value={properties.length}  sub={`${properties.reduce((s,p)=>s+p.units,0)} units managed`} icon={Icon.building} accent={C.blueLt} />
        <KPICard label="Open Tickets"     value={openMaint}          sub={`${maintenance.filter(m=>m.priority==="High"&&m.status!=="Resolved").length} high priority`} icon={Icon.wrench} accent={openMaint > 0 ? C.red : C.green} onClick={() => setTab("Maintenance")} />
      </div>

      {/* Revenue chart + Income type */}
      <div className="grid-rev">
        {/* Revenue line chart */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px" }}>Revenue Overview</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif", marginTop: 4 }}>{fmtAED(totalRent)}</div>
            </div>
            <span style={{ fontSize: 11, background: C.blueAlpha, color: C.blueLt, border: `1px solid ${C.blue}30`, borderRadius: 6, padding: "4px 10px", fontWeight: 600 }}>This Month</span>
          </div>
          <div style={{ marginTop: 14 }}>
            {revenueMonths.length >= 2
              ? <LineChart data={revenueMonths} color={C.blue} height={80} width={500} />
              : <div style={{ height: 80, display: "flex", alignItems: "center", color: C.t4, fontSize: 12 }}>No revenue data yet — add paid payments to see the trend</div>
            }
            {revenueMonths.length >= 2 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {revenueMonths.map((d, i) => (
                  <span key={i} style={{ fontSize: 9, color: C.t3, fontWeight: i === revenueMonths.length - 1 ? 700 : 400 }}>{d.month}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio by property type */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Portfolio by Property Type</div>
          {properties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.t3, fontSize: 12 }}>No properties yet</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <DonutChart segments={resTypes} size={110} thickness={20} />
              </div>
              {resTypes.map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.t2 }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{s.pct}%</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom row: Rent Collections | Maintenance Alerts | Lease Expirations */}
      <div className="grid-3col">
        {/* Rent Collections */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Rent Collections</div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 16 }}>
            <DonutChart segments={[
              { pct: collected / (collected + pending + overdue || 1) * 100, color: C.blue },
              { pct: pending  / (collected + pending + overdue || 1) * 100, color: C.amber },
              { pct: overdue  / (collected + pending + overdue || 1) * 100, color: C.red },
            ]} size={100} thickness={18} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.t1, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                {collected + pending + overdue > 0 ? Math.round(collected / (collected + pending + overdue) * 100) : 0}%
              </div>
              <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>Collected</div>
            </div>
          </div>
          {[
            ["Collected", collected, C.blue],
            ["Pending",   pending,   C.amber],
            ["Overdue",   overdue,   C.red],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 11, color: C.t2 }}>{l}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>{fmtAED(v)}</span>
            </div>
          ))}
          <button onClick={() => setTab("Payments")}
            style={{ marginTop: 12, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.t2, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.t2; }}
          >View Details →</button>
        </div>

        {/* Maintenance Alerts */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px" }}>Maintenance Alerts</div>
            <button onClick={() => setTab("Maintenance")} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>View All</button>
          </div>
          {maintenance.filter(m => m.status !== "Resolved").length === 0
            ? <div style={{ color: C.green, fontSize: 12, display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>{Icon.check} All clear — no open issues</div>
            : maintenance.filter(m => m.status !== "Resolved").slice(0, 3).map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: m.priority === "High" ? C.redAlpha : m.priority === "Medium" ? C.amberAlpha : C.blueAlpha, display: "flex", alignItems: "center", justifyContent: "center", color: m.priority === "High" ? C.red : m.priority === "Medium" ? C.amber : C.blue, flexShrink: 0 }}>{Icon.alert}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{m.issue}</div>
                      <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{m.prop}</div>
                    </div>
                  </div>
                  <Badge s={m.priority} />
                </div>
              ))
          }
        </div>

        {/* Lease Expirations */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px" }}>Lease Expirations</div>
            <button onClick={() => setTab("Tenants")} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>View All</button>
          </div>
          {properties.filter(p => p.daysLeft < 999).length === 0
            ? <div style={{ color: C.t3, fontSize: 12, padding: "8px 0" }}>No upcoming expirations</div>
            : properties.filter(p => p.daysLeft < 999).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: p.daysLeft < 30 ? C.redAlpha : C.amberAlpha, display: "flex", alignItems: "center", justifyContent: "center", color: p.daysLeft < 30 ? C.red : C.amber, flexShrink: 0 }}>{Icon.calendar}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{p.tenant}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.daysLeft < 30 ? C.red : C.amber, whiteSpace: "nowrap" }}>in {p.daysLeft}d</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Properties table (below) */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, marginTop: 14, overflow: "hidden" }}>
        <SectionHeader title="Properties" count={properties.length} right={
          <button onClick={() => setTab("Properties")} style={{ fontSize: 11, fontWeight: 600, color: C.blue, background: C.blueAlpha, border: `1px solid ${C.blue}30`, borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>View All</button>
        } />
        {properties.length === 0
          ? <div style={{ padding: "32px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>No properties yet. <button onClick={() => setTab("Properties")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }}>Add your first property →</button></div>
          : isMobile
            ? properties.map((p, i) => (
                <div key={p.id} style={{ padding: "13px 16px", borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                  onClick={() => { setSel(p); setTab("Properties"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{p.name}</div>
                    <Badge s={p.status} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.t3 }}>{p.city} · {p.type}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{fmtAED(p.rent)}/mo</span>
                  </div>
                </div>
              ))
            : <>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.4fr 1fr 90px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                  {["Property", "Type", "Rent / mo", "Occupancy", "Lease Expiry", "Status"].map(h => <TH key={h}>{h}</TH>)}
                </div>
                {properties.map((p, i) => (
                  <div key={p.id}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.4fr 1fr 90px", padding: "14px 20px", alignItems: "center", borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.blueAlpha}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                    onClick={() => { setSel(p); setTab("Properties"); }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.t3, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>{Icon.mapPin} {p.city}</div>
                    </div>
                    <span style={{ fontSize: 12, color: C.t2 }}>{p.type}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{fmtAED(p.rent)}</span>
                    <OccBar pct={p.occ} />
                    <span style={{ fontSize: 12, color: p.daysLeft < 120 ? C.red : C.t2, fontWeight: p.daysLeft < 120 ? 600 : 400 }}>{p.expiry}</span>
                    <Badge s={p.status} />
                  </div>
                ))}
              </>
        }
      </div>

      {/* Recent payments */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginTop: 14 }}>
        <SectionHeader title="Recent Payments" count={payments.length} right={
          <button onClick={() => setTab("Payments")} style={{ fontSize: 11, fontWeight: 600, color: C.blue, background: C.blueAlpha, border: `1px solid ${C.blue}30`, borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>View All</button>
        } />
        {payments.length === 0
          ? <div style={{ padding: "32px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>No payment records yet</div>
          : payments.slice(0, 5).map((t, i) => (
              <div key={t.id}
                style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 16, borderBottom: i < Math.min(payments.length, 5) - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: t.status === "Paid" ? C.greenAlpha : t.status === "Overdue" ? C.redAlpha : C.amberAlpha, display: "flex", alignItems: "center", justifyContent: "center", color: t.status === "Paid" ? C.green : t.status === "Overdue" ? C.red : C.amber, flexShrink: 0 }}>
                  {t.status === "Paid" ? Icon.check : Icon.alert}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{t.tenant}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 1 }}>{t.prop}</div>
                </div>
                <span style={{ fontSize: 11, color: C.t3, fontFamily: "monospace" }}>{t.ref}</span>
                <span style={{ fontSize: 11, color: C.t3 }}>{t.date}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.t1, width: 110, textAlign: "right" }}>{fmtAED(t.amount)}</span>
                <Badge s={t.status} />
              </div>
            ))
        }
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════════
// PROPERTIES TAB
// ════════════════════════════════════════════════════════════════════════════════
function PropertiesTab({ sel, setSel, properties, maintenance, onAddProperty, onAddUnit, onAddLease }) {
  const C = useC();
  const [search, setSearch] = useState("");
  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: sel ? "380px 1fr" : "1fr", gap: 20, alignItems: "start" }}>
      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", minWidth: 0 }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
            <span style={{ color: C.t3, display: "flex", flexShrink: 0 }}>{Icon.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties…"
              style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: C.t1, width: "100%" }} />
          </div>
          <span style={{ fontSize: 11, color: C.t3, whiteSpace: "nowrap" }}>{filtered.length} assets</span>
          <button onClick={onAddProperty}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
            {Icon.plus} Add
          </button>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.blueAlpha, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: C.blue }}>{Icon.building}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 6 }}>No properties yet</div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 20 }}>Add your first property to get started</div>
            <button onClick={onAddProperty} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add Property</button>
          </div>
        )}

        {filtered.map((p, i) => {
          const active = sel?.id === p.id;
          const maintCount = maintenance.filter(m => m.prop === p.name && m.status !== "Resolved").length;
          return (
            <div key={p.id}
              style={{ padding: "16px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "all 0.15s", borderLeft: active ? `3px solid ${C.blue}` : "3px solid transparent", background: active ? C.bluePl : "none" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}
              onClick={() => setSel(sel?.id === p.id ? null : p)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>{Icon.mapPin} {p.city} · {p.code}</div>
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: 10, alignItems: "center", flexShrink: 0 }}>
                  {maintCount > 0 && <span style={{ fontSize: 9, background: C.redAlpha, color: C.red, border: `1px solid ${C.red}30`, borderRadius: 10, padding: "2px 6px", fontWeight: 700 }}>{maintCount} open</span>}
                  <Badge s={p.status} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 18 }}>
                {[["Type", p.type], ["Rent/mo", fmtAED(p.rent)], ["Occ.", `${p.occ}%`], ["Units", p.units]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, color: C.t4, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3, fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {sel && (
        <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* Header card */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueLt} 100%)`, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)", borderRadius: 4, padding: "2px 8px", fontWeight: 600, letterSpacing: "0.5px" }}>{sel.code}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)", borderRadius: 4, padding: "2px 8px", fontWeight: 600 }}>{sel.type}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{sel.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>{Icon.mapPin} {sel.address || sel.city}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <button onClick={() => onAddUnit(sel)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" }}>
                  {Icon.plus} Unit
                </button>
                <button onClick={() => onAddLease(sel)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" }}>
                  {Icon.plus} Lease
                </button>
                <button onClick={() => setSel(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icon.x}</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
              {[
                ["Monthly Rent",   fmtAED(sel.rent), false],
                ["Occupancy",      `${sel.occ}%`,    false],
                ["Total Units",    sel.units,         false],
                ["Days to Expiry", sel.daysLeft === 999 ? "—" : sel.daysLeft, sel.daysLeft < 120 && sel.daysLeft !== 999],
              ].map(([l, v, warn], idx) => (
                <div key={l} style={{ padding: "16px 20px", borderRight: idx < 3 ? `1px solid ${C.border}` : "none", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: warn ? C.red : C.t1, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lease & info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>Lease Details</div>
              {[
                [Icon.user,     "Tenant",      sel.tenant],
                [Icon.calendar, "Expiry Date", sel.expiry],
                [Icon.home,     "Year Built",  sel.yearBuilt],
              ].map(([ic, l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.t2, display: "flex", alignItems: "center", gap: 6 }}>{ic} {l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <span style={{ fontSize: 12, color: C.t2 }}>Status</span>
                <Badge s={sel.status} />
              </div>
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>Property Info</div>
              {[
                ["Total Area",    sel.sqft ? `${fmt(sel.sqft)} sq.ft` : "—"],
                ["Floors",        sel.floors],
                ["Parking Spots", sel.parkingSpots],
                ["City",          sel.city],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.t2 }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open maintenance */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Open Maintenance" />
            <div style={{ padding: "12px 20px" }}>
              {(() => {
                const items = maintenance.filter(m => m.prop === sel.name && m.status !== "Resolved");
                if (!items.length) return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green, fontSize: 13, padding: "4px 0" }}>
                    {Icon.check} No open maintenance issues
                  </div>
                );
                return items.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>{m.issue}</div>
                      <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{m.ref} · {m.date} · {m.assignee}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge s={m.priority} />
                      <Badge s={m.status} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PAYMENTS TAB
// ════════════════════════════════════════════════════════════════════════════════
function PaymentsTab({ payments, properties, onAddPayment }) {
  const C = useC();
  const { isMobile } = useBreakpoint();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const statuses = ["All", "Paid", "Pending", "Overdue"];
  const filtered = payments.filter(t =>
    (filter === "All" || t.status === filter) &&
    (t.tenant.toLowerCase().includes(search.toLowerCase()) ||
     t.ref.toLowerCase().includes(search.toLowerCase()) ||
     t.prop.toLowerCase().includes(search.toLowerCase()))
  );

  const collected = payments.filter(t => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const pending   = payments.filter(t => t.status === "Pending").reduce((s, t) => s + t.amount, 0);
  const overdue   = payments.filter(t => t.status === "Overdue").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fade-in">
      <div className="grid-pay">
        <KPICard label="Collected" value={fmtAED(collected)} sub={`${payments.filter(t => t.status === "Paid").length} payments`}    icon={Icon.check}   accent={C.green} />
        <KPICard label="Pending"   value={fmtAED(pending)}   sub={`${payments.filter(t => t.status === "Pending").length} payment${payments.filter(t => t.status === "Pending").length !== 1 ? "s" : ""}`} icon={Icon.calendar} accent={C.amber} />
        <KPICard label="Overdue"   value={fmtAED(overdue)}   sub="Action required"                                                    icon={Icon.alert}    accent={C.red}   />
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginRight: 4 }}>Transactions</span>
          <div style={{ display: "flex", gap: 6 }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filter === s ? C.blue : C.border}`, background: filter === s ? C.blue : C.white, color: filter === s ? "#fff" : C.t2, transition: "all 0.15s" }}>{s}</button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
              <span style={{ color: C.t3, display: "flex" }}>{Icon.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: C.t1, width: 160 }} />
            </div>
            <button onClick={onAddPayment}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {Icon.plus} Record Payment
            </button>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "100px 1.4fr 1.4fr 1fr 1fr 100px 90px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            {["Ref", "Tenant", "Property", "Date", "Amount", "Method", "Status"].map(h => <TH key={h}>{h}</TH>)}
          </div>
        )}

        {filtered.length === 0
          ? <div style={{ padding: "40px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>
              {payments.length === 0 ? "No payment records yet. Click \"Record Payment\" to add one." : "No transactions match your filter."}
            </div>
          : filtered.map((t, i) => isMobile ? (
              <div key={t.id} style={{ padding: "14px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{t.tenant}</div>
                  <Badge s={t.status} />
                </div>
                <div style={{ fontSize: 12, color: C.t2, marginBottom: 6 }}>{t.prop}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.t3 }}>{t.date} · {t.method}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{fmtAED(t.amount)}</span>
                </div>
              </div>
            ) : (
              <div key={t.id}
                style={{ display: "grid", gridTemplateColumns: "100px 1.4fr 1.4fr 1fr 1fr 100px 90px", padding: "13px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: 11, fontFamily: "monospace", color: C.t3 }}>{t.ref}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{t.tenant}</div>
                <span style={{ fontSize: 12, color: C.t2 }}>{t.prop}</span>
                <span style={{ fontSize: 12, color: C.t2 }}>{t.date}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{fmtAED(t.amount)}</span>
                <span style={{ fontSize: 11, color: C.t3 }}>{t.method}</span>
                <Badge s={t.status} />
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAINTENANCE TAB
// ════════════════════════════════════════════════════════════════════════════════
function MaintenanceTab({ maintenance }) {
  const C = useC();
  const { isMobile } = useBreakpoint();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "High", "Medium", "Low"];
  const filtered = maintenance.filter(m =>
    (filter === "All" || m.priority === filter) &&
    (m.issue.toLowerCase().includes(search.toLowerCase()) ||
     m.prop.toLowerCase().includes(search.toLowerCase()) ||
     m.ref.toLowerCase().includes(search.toLowerCase()))
  );
  const openMaint = maintenance.filter(m => m.status !== "Resolved").length;
  const priorityAccent = { High: C.red, Medium: C.amber, Low: C.t4 };

  return (
    <div className="fade-in">
      <div className="grid-maint">
        <KPICard label="Open Requests" value={openMaint} sub="Needs attention" icon={Icon.wrench} accent={C.red} />
        <KPICard label="High Priority" value={maintenance.filter(m => m.priority === "High" && m.status !== "Resolved").length} sub="Escalate immediately" icon={Icon.alert} accent={C.red} />
        <KPICard label="Resolved"      value={maintenance.filter(m => m.status === "Resolved").length} sub="Total resolved" icon={Icon.check} accent={C.green} />
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginRight: 4 }}>Maintenance Requests</span>
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filter === f ? C.blue : C.border}`, background: filter === f ? C.blue : C.white, color: filter === f ? "#fff" : C.t2, transition: "all 0.15s" }}>{f}</button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
            <span style={{ color: C.t3, display: "flex" }}>{Icon.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests…"
              style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: C.t1, width: 180 }} />
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "90px 2fr 1.4fr 1fr 1fr 80px 100px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            {["Ref", "Issue", "Property", "Assignee", "Date", "Priority", "Status"].map(h => <TH key={h}>{h}</TH>)}
          </div>
        )}

        {filtered.length === 0
          ? <div style={{ padding: "40px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>
              {maintenance.length === 0 ? "No maintenance requests. Tenants can submit requests via the Tenant Portal." : "No requests match your filter."}
            </div>
          : filtered.map((m, i) => isMobile ? (
              <div key={m.id} style={{ padding: "14px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", borderLeft: `3px solid ${priorityAccent[m.priority] || C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: m.status === "Resolved" ? C.t3 : C.t1, flex: 1, marginRight: 8 }}>{m.issue}</div>
                  <Badge s={m.status} />
                </div>
                <div style={{ fontSize: 12, color: C.t2, marginBottom: 6 }}>{m.prop}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: m.assignee === "Unassigned" ? C.red : C.t3, fontWeight: m.assignee === "Unassigned" ? 600 : 400 }}>{m.assignee} · {m.date}</span>
                  <Badge s={m.priority} />
                </div>
              </div>
            ) : (
              <div key={m.id}
                style={{ display: "grid", gridTemplateColumns: "90px 2fr 1.4fr 1fr 1fr 80px 100px", padding: "13px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", borderLeft: `3px solid ${priorityAccent[m.priority] || C.border}`, transition: "background 0.12s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: 11, fontFamily: "monospace", color: C.t3 }}>{m.ref}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: m.status === "Resolved" ? C.t3 : C.t1 }}>{m.issue}</div>
                <span style={{ fontSize: 12, color: C.t2 }}>{m.prop}</span>
                <span style={{ fontSize: 12, color: m.assignee === "Unassigned" ? C.red : C.t2, fontWeight: m.assignee === "Unassigned" ? 600 : 400 }}>{m.assignee}</span>
                <span style={{ fontSize: 12, color: C.t2 }}>{m.date}</span>
                <Badge s={m.priority} />
                <Badge s={m.status} />
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT TAB
// ════════════════════════════════════════════════════════════════════════════════
function AssistantTab({ properties, payments, maintenance, displayName }) {
  const C = useC();
  const firstName = displayName?.split(" ")[0] || "there";
  const [msgs, setMsgs] = useState([{
    role: "ai",
    text: `Hello, ${firstName}! I have full context on your portfolio. Ask me anything:\n— What is my total rental income?\n— Which leases expire soon?\n— Any urgent maintenance?\n— Current occupancy rate?\n— Any overdue payments?`,
  }]);
  const [query, setQuery] = useState("");
  const [busy,  setBusy]  = useState(false);
  const endRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const aiCtxRef = useRef(null);
  aiCtxRef.current = buildAICtx(properties, payments, maintenance);

  const send = useCallback(async (q) => {
    const text = (q || query).trim();
    if (!text || busy) return;
    setQuery(""); setBusy(true);
    setMsgs(p => [...p, { role: "user", text }]);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
    const ctx = aiCtxRef.current;
    const t = text.toLowerCase();
    let reply = ctx.default;
    if (t.match(/income|revenue|rent|money|earn|collect/)) reply = ctx.income;
    else if (t.match(/expir|lease|renew|upcoming/))        reply = ctx.expiry;
    else if (t.match(/maint|repair|issue|request|fix/))   reply = ctx.maint;
    else if (t.match(/occup|vacant|empty|fill/))           reply = ctx.occ;
    else if (t.match(/overdue|late|unpaid|miss/))          reply = ctx.overdue;
    setMsgs(p => [...p, { role: "ai", text: reply }]);
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [query, busy]);

  const renderMD = t => t
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.t1}">$1</strong>`)
    .replace(/\n—/g, "<br/>—")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  const chips = ["What's my total income?", "Which leases expire soon?", "Any urgent maintenance?", "Current occupancy rate?", "Any overdue payments?"];

  const totalRent = properties.reduce((s, p) => s + p.rent, 0);
  const unitCount = properties.reduce((s, p) => s + p.units, 0);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueLt} 100%)` }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AugmenticsLogoMark size={22} onDark />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Augmentics — Portfolio Assistant</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>
              {properties.length} propert{properties.length === 1 ? "y" : "ies"} · {unitCount} units · AED {totalRent.toLocaleString()}/mo
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "5px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>Online</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {m.role === "ai" && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AugmenticsLogoMark size={18} onDark />
                </div>
              )}
              <div style={{ maxWidth: "68%", background: m.role === "user" ? `linear-gradient(135deg, ${C.blue}, ${C.blueLt})` : C.bg, border: `1px solid ${m.role === "user" ? "transparent" : C.border}`, borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "2px 14px 14px 14px", padding: "12px 16px", fontSize: 13, lineHeight: 1.75, color: m.role === "user" ? "#fff" : C.t2, boxShadow: m.role === "user" ? `0 4px 12px ${C.blueAlpha}` : "none" }}
                dangerouslySetInnerHTML={{ __html: renderMD(m.text) }}
              />
              {m.role === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1B5FD8, #3B7EF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{(displayName || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
              )}
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AugmenticsLogoMark size={18} onDark />
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "2px 14px 14px 14px", padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 10, flexWrap: "wrap" }}>
        {chips.map(q => (
          <button key={q} onClick={() => send(q)} disabled={busy}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, color: C.t2, fontSize: 11, fontWeight: 500, padding: "6px 13px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; e.currentTarget.style.background = C.bluePl; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.t2; e.currentTarget.style.background = C.white; }}
          >{q}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your portfolio…" disabled={busy}
          style={{ flex: 1, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.t1, fontSize: 13, padding: "12px 16px", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit" }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={() => send()} disabled={busy || !query.trim()}
          style={{ background: busy || !query.trim() ? C.border : C.blue, border: "none", borderRadius: 10, color: busy || !query.trim() ? C.t3 : "#fff", fontSize: 13, fontWeight: 600, padding: "12px 22px", cursor: busy || !query.trim() ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: !busy && query.trim() ? `0 4px 12px ${C.blueAlpha}` : "none" }}
          onMouseEnter={e => { if (!busy && query.trim()) e.currentTarget.style.background = C.blueDk; }}
          onMouseLeave={e => { if (!busy && query.trim()) e.currentTarget.style.background = C.blue; }}
        >{Icon.send} Send</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DASHBOARD CONTENT (uses DataContext)
// ════════════════════════════════════════════════════════════════════════════════
// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const C = useC();
  const { profile, refreshProfile } = useAuth();
  const { region, setRegion } = useSettings();
  const [name,   setName]   = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState('');

  const saveProfile = async () => {
    if (!name.trim()) { setErr('Name cannot be empty.'); return; }
    setSaving(true); setErr('');
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', profile.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    await refreshProfile(); // sync sidebar display name immediately
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const iSt = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.t1, fontFamily: 'inherit', outline: 'none', background: C.inputBg };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 740 }}>

      {/* Profile card */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'flex', alignItems: 'center', gap: 7 }}>
          {Icon.user} Profile
        </div>
        <div style={{ padding: '22px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1B5FD8, #3B7EF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(name || profile?.email || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Full Name</label>
                <input style={iSt} value={name} onChange={e => { setName(e.target.value); setSaved(false); }} placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Email</label>
                <div style={{ ...iSt, background: C.bg, color: C.t3, border: `1px solid ${C.border}` }}>{profile?.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: saved ? C.green : C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
              <span style={{ fontSize: 11, background: C.blueAlpha, color: C.blue, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                {profile?.role === 'tenant' ? 'Tenant' : 'Portfolio Manager'}
              </span>
            </div>
            {err && <div style={{ fontSize: 12, color: C.red }}>{err}</div>}
          </div>
        </div>
      </div>

      {/* Regional settings card */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'flex', alignItems: 'center', gap: 7 }}>
          {Icon.globe} Regional Settings
        </div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontSize: 13, color: C.t3, marginBottom: 18 }}>
            Select your country to set the display currency across the entire app.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {GCC.map(r => (
              <button key={r.id} onClick={() => setRegion(r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
                  borderRadius: 10, border: `2px solid ${region.id === r.id ? C.blue : C.border}`,
                  background: region.id === r.id ? C.bluePl : C.white,
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: region.id === r.id ? C.blue : C.t1 }}>{r.country}</div>
                  <div style={{ fontSize: 11, color: C.t3 }}>{r.currency} · {r.cities}</div>
                </div>
                {region.id === r.id && <span style={{ color: C.blue, display: 'flex', flexShrink: 0 }}>{Icon.check}</span>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: C.bg, borderRadius: 8, fontSize: 12, color: C.t3 }}>
            Current: <strong style={{ color: C.t1 }}>{region.flag} {region.country} · {region.currency}</strong> — all amounts display in {region.currency}.
          </div>
        </div>
      </div>

      {/* Tenant info */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.7px', display: 'flex', alignItems: 'center', gap: 7 }}>
          {Icon.user} Tenant Portal Info
        </div>
        <div style={{ padding: '20px 22px', fontSize: 13, color: C.t2, lineHeight: 1.8 }}>
          <strong>How the Tenant Portal works:</strong>
          <ol style={{ marginTop: 10, paddingLeft: 20, color: C.t3, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>The tenant signs up at this app — they must select <strong style={{ color: C.t1 }}>"Tenant"</strong> as account type on signup.</li>
            <li>You add a unit under a property, then click <strong style={{ color: C.t1 }}>+ Lease</strong> on the property detail panel.</li>
            <li>Enter the tenant's exact sign-up email to link the lease.</li>
            <li>The tenant logs in and sees their lease, submits payments, and reports issues from their portal.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// TENANTS TAB
// ════════════════════════════════════════════════════════════════════════════════
const DOC_TYPES = [
  "Passport Copy", "Emirates ID", "Visa Copy",
  "Tenancy Contract", "Security Deposit Cheque", "PDC Cheques",
];

function TenantCard({ lease, onAddLease }) {
  const C = useC();
  const [copied, setCopied] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const storageKey = `docs_${lease.id}`;
  const [checkedDocs, setCheckedDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });

  const copyCode = () => {
    navigator.clipboard.writeText(lease.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDoc = (doc) => {
    const next = checkedDocs.includes(doc)
      ? checkedDocs.filter(d => d !== doc)
      : [...checkedDocs, doc];
    setCheckedDocs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const initials = lease.tenantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const docsReceived = checkedDocs.length;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {/* Top row */}
      <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: C.bluePl, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.blue, flexShrink: 0, fontFamily: "'Syne', sans-serif" }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{lease.tenantName}</div>
            <div style={{ fontSize: 12, color: C.t3 }}>{lease.propertyName} · Unit {lease.unitNumber}</div>
          </div>
        </div>
        <Badge s={lease.status} />
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        {[
          ["Monthly Rent", fmtAED(lease.monthlyRent)],
          ["Lease Start",  lease.startDate],
          ["Lease End",    lease.endDate],
        ].map(([label, val], i) => (
          <div key={label} style={{ padding: "12px 20px", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Access code */}
      <div style={{ padding: "14px 20px", background: C.blueAlpha, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
            Tenant Access Code — share this to let them log in
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "5px", color: lease.accessCode ? C.blue : C.t4, fontFamily: "'Syne', monospace" }}>
            {lease.accessCode || "—"}
          </div>
        </div>
        {lease.accessCode && (
          <button onClick={copyCode}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${copied ? C.green : C.blue}30`, background: copied ? C.greenAlpha : C.bluePl, color: copied ? C.green : C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", flexShrink: 0 }}>
            {copied ? Icon.checkCircle : Icon.copy}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        )}
      </div>

      {/* Documents section */}
      <div style={{ padding: "0 20px" }}>
        <button onClick={() => setDocsOpen(o => !o)}
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.t2 }}>Documents</span>
            <span style={{ fontSize: 11, color: docsReceived === DOC_TYPES.length ? C.green : C.amber, background: docsReceived === DOC_TYPES.length ? C.greenAlpha : C.amberAlpha, borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>
              {docsReceived}/{DOC_TYPES.length} received
            </span>
          </div>
          <span style={{ color: C.t3, transform: docsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>{Icon.chevDown}</span>
        </button>

        {docsOpen && (
          <div style={{ paddingBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {DOC_TYPES.map(doc => {
              const checked = checkedDocs.includes(doc);
              return (
                <button key={doc} onClick={() => toggleDoc(doc)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: `1px solid ${checked ? C.green : C.border}`, background: checked ? C.greenAlpha : C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? C.green : C.border}`, background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: checked ? C.green : C.t2 }}>{doc}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TenantsTab({ tenants, properties, onAddTenant }) {
  const C = useC();
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = () => {
    if (properties.length === 0) return;
    if (properties.length === 1) { onAddTenant(properties[0]); return; }
    setShowPicker(true);
  };

  return (
    <div>
      {showPicker && (
        <Modal title="Select Property for New Tenant" onClose={() => setShowPicker(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, color: C.t3, marginBottom: 8 }}>Which property is this tenant moving into?</div>
            {properties.map(p => {
              const vacant = (p._units || []).filter(u => u.status === "vacant").length;
              return (
                <button key={p.id} onClick={() => { onAddTenant(p); setShowPicker(false); }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.bluePl; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{p.city}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: vacant > 0 ? C.green : C.amber, background: vacant > 0 ? C.greenAlpha : C.amberAlpha, borderRadius: 8, padding: "4px 10px" }}>
                    {vacant > 0 ? `${vacant} vacant unit${vacant > 1 ? "s" : ""}` : "All units occupied"}
                  </div>
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, fontFamily: "'Syne', sans-serif" }}>Tenants</div>
          <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} · manage access codes and documents
          </div>
        </div>
        <button onClick={handleAdd} disabled={properties.length === 0}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 9, border: "none", background: properties.length === 0 ? C.border : C.blue, color: properties.length === 0 ? C.t3 : "#fff", fontSize: 13, fontWeight: 700, cursor: properties.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: properties.length === 0 ? "none" : `0 4px 14px ${C.blue}30` }}>
          {Icon.plus} Add Tenant
        </button>
      </div>

      {properties.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.blueAlpha, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: C.blue }}>{Icon.building}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t2, marginBottom: 6 }}>Add a property first</div>
          <div style={{ fontSize: 13, color: C.t3 }}>Go to Properties to add your first property before adding tenants.</div>
        </div>
      ) : tenants.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.blueAlpha, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: C.blue }}>{Icon.tenants}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.t2, marginBottom: 8 }}>No tenants yet</div>
          <div style={{ fontSize: 13, color: C.t3, marginBottom: 20, lineHeight: 1.6 }}>
            Click <strong>Add Tenant</strong> to create a tenant account.<br />
            They'll get a unique access code to log into the Tenant Portal.
          </div>
          <button onClick={handleAdd}
            style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + Add Your First Tenant
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tenants.map(t => <TenantCard key={t.id} lease={t} onAddLease={onAddTenant} />)}
        </div>
      )}
    </div>
  );
}

// ─── Properties + Tenant side panel (right, Overview only) ───────────────────
function RightInfoPanel({ properties, tenants, setTab, setSel }) {
  const C = useC();
  return (
    <div style={{ width: 260, borderLeft: `1px solid ${C.border}`, background: C.bg, overflow: "auto", flexShrink: 0 }}>
      {/* Properties */}
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>Properties</span>
          <button onClick={() => setTab("Properties")} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>View all</button>
        </div>
        {properties.length === 0
          ? <div style={{ fontSize: 12, color: C.t3, padding: "12px 0" }}>No properties yet</div>
          : properties.slice(0, 3).map(p => (
              <div key={p.id}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.15s" }}
                onClick={() => { setSel(p); setTab("Properties"); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{p.type} · {p.units} Units</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: C.t3 }}>Occupancy</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: p.occ >= 80 ? C.green : p.occ >= 60 ? C.amber : C.red }}>{p.occ}% Occupied</span>
                  </div>
                  <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${p.occ}%`, height: "100%", background: p.occ >= 80 ? C.green : p.occ >= 60 ? C.amber : C.red, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      <div style={{ height: 1, background: C.border }} />

      {/* Tenant Overview */}
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>Tenant Overview</span>
          <button onClick={() => setTab("Tenants")} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>View all</button>
        </div>
        {tenants.length === 0
          ? <div style={{ fontSize: 12, color: C.t3, padding: "12px 0" }}>No tenants yet</div>
          : tenants.slice(0, 5).map(t => {
              const initials = t.tenantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const statusColor = t.status === "Active" ? C.green : t.status === "Expiring" ? C.amber : C.red;
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blueAlpha, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.blueLt, flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tenantName}</div>
                    <div style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>Unit {t.unitNumber} · {t.propertyName.split(" ").slice(0, 2).join(" ")}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>{t.status}</span>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ─── AI side panel (right, Overview only) ────────────────────────────────────
function AISidePanel({ properties, payments, maintenance, displayName }) {
  const C = useC();
  const firstName = displayName?.split(" ")[0] || "there";
  const [msgs, setMsgs] = useState([{
    role: "ai",
    text: `Hello, ${firstName}! I have full context on your portfolio. Ask me:\n— Total rental income?\n— Which leases expire soon?\n— Any urgent maintenance?`,
  }]);
  const [query, setQuery] = useState("");
  const [busy, setBusy]   = useState(false);
  const endRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const aiCtxRef = useRef(null);
  aiCtxRef.current = buildAICtx(properties, payments, maintenance);

  const send = useCallback(async (q) => {
    const text = (q || query).trim();
    if (!text || busy) return;
    setQuery(""); setBusy(true);
    setMsgs(p => [...p, { role: "user", text }]);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const ctx = aiCtxRef.current;
    const t = text.toLowerCase();
    let reply = ctx.default;
    if (t.match(/income|revenue|rent|money|earn|collect/)) reply = ctx.income;
    else if (t.match(/expir|lease|renew|upcoming/))        reply = ctx.expiry;
    else if (t.match(/maint|repair|issue|request|fix/))   reply = ctx.maint;
    else if (t.match(/occup|vacant|empty|fill/))           reply = ctx.occ;
    else if (t.match(/overdue|late|unpaid|miss/))          reply = ctx.overdue;
    setMsgs(p => [...p, { role: "ai", text: reply }]);
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [query, busy]);

  const renderMD = t => t
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.t1}">$1</strong>`)
    .replace(/\n—/g, "<br/>—").replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

  return (
    <div style={{ width: 300, borderLeft: `1px solid ${C.border}`, background: C.bg, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: C.white }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <AugmenticsLogoMark size={20} onDark />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Augmentics Assistant</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 7, alignItems: "flex-end" }}>
            {m.role === "ai" && (
              <div style={{ width: 26, height: 26, borderRadius: 7, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AugmenticsLogoMark size={14} onDark />
              </div>
            )}
            <div style={{ maxWidth: "80%", background: m.role === "user" ? `linear-gradient(135deg,${C.blue},${C.blueLt})` : C.white, border: `1px solid ${m.role === "user" ? "transparent" : C.border}`, borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px", padding: "9px 11px", fontSize: 11.5, lineHeight: 1.7, color: m.role === "user" ? "#fff" : C.t2 }}
              dangerouslySetInnerHTML={{ __html: renderMD(m.text) }}
            />
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AugmenticsLogoMark size={14} onDark />
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "2px 12px 12px 12px", padding: "10px 14px", display: "flex", gap: 4 }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "6px 8px 6px 12px", transition: "border-color 0.15s" }}
          onFocusCapture={e => e.currentTarget.style.borderColor = C.blue}
          onBlurCapture={e => e.currentTarget.style.borderColor = C.border}
        >
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask anything…" disabled={busy}
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 12, color: C.t1, fontFamily: "inherit" }}
          />
          <button onClick={() => send()} disabled={busy || !query.trim()}
            style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: busy || !query.trim() ? C.border : C.blue, color: "#fff", cursor: busy || !query.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
            {Icon.send}
          </button>
        </div>
        <div style={{ fontSize: 9, color: C.t4, marginTop: 5, textAlign: "center" }}>AI responses may not be 100% accurate</div>
      </div>
    </div>
  );
}

// ─── Bottom nav (mobile only) ─────────────────────────────────────────────────
function BottomNav({ tab, setTab, setSel, openMaint }) {
  const C = useC();
  const mobileNav = [
    { id: "Overview",     label: "Home",     icon: Icon.home      },
    { id: "Properties",   label: "Props",    icon: Icon.building  },
    { id: "Tenants",      label: "Tenants",  icon: Icon.tenants   },
    { id: "Payments",     label: "Payments", icon: Icon.payment   },
    { id: "Maintenance",  label: "Issues",   icon: Icon.wrench    },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 60, background: C.sidebar, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", zIndex: 200,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {mobileNav.map(n => {
        const active = tab === n.id;
        return (
          <button key={n.id} onClick={() => { setTab(n.id); setSel(null); }}
            style={{
              flex: 1, height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              color: active ? "#fff" : C.sideT2,
              position: "relative",
            }}
          >
            {active && (
              <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 2, borderRadius: 2, background: C.blue }} />
            )}
            <span style={{ display: "flex" }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{n.label}</span>
            {n.id === "Maintenance" && openMaint > 0 && (
              <span style={{ position: "absolute", top: 8, right: "calc(50% - 14px)", width: 7, height: 7, borderRadius: "50%", background: C.red, border: `1.5px solid ${C.sidebar}` }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DashboardContent({ theme, toggleTheme }) {
  const C = useC();
  const { properties, payments, maintenance, tenants, revenueMonths, loading } = useAppData();
  const { profile, signOut } = useAuth();

  const [tab,          setTab]          = useState("Overview");
  const [sel,          setSel]          = useState(null);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [showAddProp,  setShowAddProp]  = useState(false);
  const [addUnitProp,  setAddUnitProp]  = useState(null);
  const [addLeaseProp, setAddLeaseProp] = useState(null);
  const [showAddPay,   setShowAddPay]   = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  useEffect(() => {
    const onMouseDown = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const initials    = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const openMaint   = maintenance.filter(m => m.status !== "Resolved").length;

  const { isMobile } = useBreakpoint();

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", background: C.bg }}>
        {!isMobile && <Sidebar tab={tab} setTab={setTab} setSel={setSel} profileOpen={false} setProfileOpen={() => {}} profileRef={profileRef}
          displayName={displayName} initials={initials} signOut={signOut} openMaint={0} />}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${C.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 13, color: C.t3 }}>Loading portfolio data…</div>
        </div>
      </div>
    );
  }

  const isOverview = tab === "Overview";

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
      {!isMobile && (
        <Sidebar
          tab={tab} setTab={setTab} setSel={setSel}
          profileOpen={profileOpen} setProfileOpen={setProfileOpen} profileRef={profileRef}
          displayName={displayName} initials={initials} signOut={signOut} openMaint={openMaint}
        />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar tab={tab} notifOpen={notifOpen} setNotifOpen={setNotifOpen} notifRef={notifRef} openMaint={openMaint} theme={theme} toggleTheme={toggleTheme} displayName={displayName} initials={initials} signOut={signOut} profileOpen={profileOpen} setProfileOpen={setProfileOpen} profileRef={profileRef} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          {/* Main scrollable content */}
          <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px 14px 80px" : "20px 24px" }}>
            {tab === "Overview"    && <OverviewTab    setTab={setTab} setSel={setSel} properties={properties} payments={payments} maintenance={maintenance} revenueMonths={revenueMonths} />}
            {tab === "Properties"  && <PropertiesTab  sel={sel} setSel={setSel} properties={properties} maintenance={maintenance} onAddProperty={() => setShowAddProp(true)} onAddUnit={prop => setAddUnitProp(prop)} onAddLease={prop => setAddLeaseProp(prop)} />}
            {tab === "Tenants"     && <TenantsTab     tenants={tenants} properties={properties} onAddTenant={prop => setAddLeaseProp(prop)} />}
            {tab === "Payments"    && <PaymentsTab    payments={payments} properties={properties} onAddPayment={() => setShowAddPay(true)} />}
            {tab === "Maintenance" && <MaintenanceTab maintenance={maintenance} />}
            {tab === "Assistant"   && <AssistantTab   properties={properties} payments={payments} maintenance={maintenance} displayName={displayName} />}
            {tab === "Settings"    && <SettingsTab />}
          </div>
          {/* Right panels — visible on Overview, desktop only */}
          {isOverview && !isMobile && <RightInfoPanel properties={properties} tenants={tenants} setTab={setTab} setSel={setSel} />}
          {isOverview && !isMobile && <AISidePanel    properties={properties} payments={payments} maintenance={maintenance} displayName={displayName} />}
        </div>
      </div>

      {/* Bottom navigation — mobile only */}
      {isMobile && (
        <BottomNav tab={tab} setTab={setTab} setSel={setSel} openMaint={openMaint} />
      )}

      {showAddProp  && <AddPropertyModal onClose={() => setShowAddProp(false)} onSaved={() => setTab("Properties")} />}
      {addUnitProp  && <AddUnitModal     property={addUnitProp} onClose={() => setAddUnitProp(null)} />}
      {addLeaseProp && <AddLeaseModal    property={addLeaseProp} onClose={() => setAddLeaseProp(null)} />}
      {showAddPay   && <RecordPaymentModal properties={properties} onClose={() => setShowAddPay(false)} />}
    </div>
  );
}

// ─── Spin keyframe (added to global styles inline) ───────────────────────────
const _spinStyle = document.createElement("style");
_spinStyle.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
if (!document.head.querySelector("[data-spin]")) {
  _spinStyle.dataset.spin = "1";
  document.head.appendChild(_spinStyle);
}

// ════════════════════════════════════════════════════════════════════════════════
// DASHBOARD EXPORT — wraps everything in the data provider
// ════════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [theme, setTheme] = useState(() => localStorage.getItem('aug_theme') || 'dark');
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('aug_theme', next);
  }, [theme]);

  return (
    <ThemeCtx.Provider value={theme === 'dark' ? DARK : LIGHT}>
      <DataProvider>
        <DashboardContent theme={theme} toggleTheme={toggleTheme} />
      </DataProvider>
    </ThemeCtx.Provider>
  );
}
