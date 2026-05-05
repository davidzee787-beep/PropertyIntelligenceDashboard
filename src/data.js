export const PROPERTIES = [
  {
    id: 1,
    name: "Greenfield Residences",
    code: "GR-001",
    type: "Residential",
    city: "Dubai Hills",
    address: "Villa 12, Greenfield Estate, Dubai Hills",
    units: 1,
    occ: 100,
    rent: 12000,
    expiry: "30 Nov 2025",
    expiryISO: "2025-11-30",
    tenant: "Al Fardan Family",
    daysLeft: 217,
    maint: 1,
    status: "Active",
    yearBuilt: 2019,
    sqft: 4200,
    floors: 2,
    parkingSpots: 2,
  },
  {
    id: 2,
    name: "Horizon Office Tower",
    code: "HO-012",
    type: "Commercial",
    city: "Business Bay",
    address: "Level 12–15, Horizon Tower, Business Bay",
    units: 4,
    occ: 75,
    rent: 48000,
    expiry: "15 Jun 2025",
    expiryISO: "2025-06-15",
    tenant: "3 Active Tenants",
    daysLeft: 49,
    maint: 0,
    status: "Expiring",
    yearBuilt: 2016,
    sqft: 18500,
    floors: 4,
    parkingSpots: 12,
  },
  {
    id: 3,
    name: "Central Retail Plaza",
    code: "CR-007",
    type: "Commercial",
    city: "Downtown Dubai",
    address: "Ground Floor, Central Plaza, Downtown Dubai",
    units: 5,
    occ: 80,
    rent: 62000,
    expiry: "01 Mar 2026",
    expiryISO: "2026-03-01",
    tenant: "4 Active Tenants",
    daysLeft: 308,
    maint: 3,
    status: "Active",
    yearBuilt: 2018,
    sqft: 22000,
    floors: 1,
    parkingSpots: 40,
  },
  {
    id: 4,
    name: "Al Quoz Warehouse A",
    code: "AQ-003",
    type: "Industrial",
    city: "Al Quoz",
    address: "Plot 18, Industrial Zone 3, Al Quoz",
    units: 3,
    occ: 67,
    rent: 28500,
    expiry: "20 Aug 2025",
    expiryISO: "2025-08-20",
    tenant: "2 Active Tenants",
    daysLeft: 115,
    maint: 2,
    status: "Expiring",
    yearBuilt: 2014,
    sqft: 35000,
    floors: 1,
    parkingSpots: 20,
  },
];

export const TRANSACTIONS = [
  { id:1, ref:"TXN-2604", prop:"Greenfield Residences", tenant:"Al Fardan Family",  amount:12000, date:"01 Apr 2026", method:"Bank Transfer",  status:"Paid"    },
  { id:2, ref:"TXN-2605", prop:"Horizon Office Tower",  tenant:"TechCorp LLC",       amount:18000, date:"03 Apr 2026", method:"Cheque",         status:"Paid"    },
  { id:3, ref:"TXN-2606", prop:"Central Retail Plaza",  tenant:"Café Milano",        amount:9500,  date:"05 Apr 2026", method:"Bank Transfer",  status:"Paid"    },
  { id:4, ref:"TXN-2607", prop:"Al Quoz Warehouse A",   tenant:"Gulf Logistics",     amount:14000, date:"07 Apr 2026", method:"Online Payment", status:"Overdue" },
  { id:5, ref:"TXN-2608", prop:"Central Retail Plaza",  tenant:"Fashion Hub",        amount:15000, date:"10 Apr 2026", method:"Bank Transfer",  status:"Paid"    },
  { id:6, ref:"TXN-2609", prop:"Horizon Office Tower",  tenant:"Legal Partners LLP", amount:12500, date:"12 Apr 2026", method:"Cheque",         status:"Pending" },
  { id:7, ref:"TXN-2610", prop:"Central Retail Plaza",  tenant:"Tech Retail Co.",    amount:8200,  date:"15 Apr 2026", method:"Bank Transfer",  status:"Paid"    },
  { id:8, ref:"TXN-2611", prop:"Al Quoz Warehouse A",   tenant:"AluPack FZCO",       amount:14500, date:"18 Apr 2026", method:"Online Payment", status:"Paid"    },
];

export const MAINTENANCE = [
  { id:1, ref:"MNT-0041", prop:"Greenfield Residences", issue:"AC unit service & filter replacement",  priority:"Medium", status:"In Progress", date:"20 Apr 2026", assignee:"CoolTech Services"     },
  { id:2, ref:"MNT-0042", prop:"Central Retail Plaza",  issue:"Plumbing leak — Shop 9, ground floor",  priority:"High",   status:"Open",        date:"24 Apr 2026", assignee:"Unassigned"            },
  { id:3, ref:"MNT-0043", prop:"Central Retail Plaza",  issue:"Parking gate motor malfunction",        priority:"Low",    status:"Open",        date:"22 Apr 2026", assignee:"AutoGate Dubai"        },
  { id:4, ref:"MNT-0044", prop:"Al Quoz Warehouse A",   issue:"Loading dock door — track replacement", priority:"High",   status:"Open",        date:"25 Apr 2026", assignee:"Unassigned"            },
  { id:5, ref:"MNT-0045", prop:"Al Quoz Warehouse A",   issue:"Security camera unit 3 offline",        priority:"Medium", status:"Open",        date:"23 Apr 2026", assignee:"SecureTech LLC"        },
  { id:6, ref:"MNT-0046", prop:"Central Retail Plaza",  issue:"External signage lighting replacement", priority:"Low",    status:"Resolved",    date:"15 Apr 2026", assignee:"BrightSigns UAE"       },
];

export const REVENUE_MONTHS = [
  { month:"Nov", value:138400 },
  { month:"Dec", value:142000 },
  { month:"Jan", value:144500 },
  { month:"Feb", value:141200 },
  { month:"Mar", value:145800 },
  { month:"Apr", value:150500 },
];

export const AI_KB = {
  income:
    "Your total rental income this month is **AED 150,500**.\n\nBreakdown by property:\n— Greenfield Residences: AED 12,000\n— Horizon Office Tower: AED 48,000\n— Central Retail Plaza: AED 62,000\n— Al Quoz Warehouse A: AED 28,500\n\nMonth-over-month growth: **+4.2%**. Central Retail Plaza is your highest-yielding asset at AED 62,000/mo.",
  expiry:
    "Two leases require urgent attention:\n\n— **Horizon Office Tower** (HO-012): expires 15 Jun 2025, only **49 days remaining**. Renewal negotiation should begin immediately — revenue at risk: AED 48,000/mo.\n\n— **Al Quoz Warehouse A** (AQ-003): expires 20 Aug 2025, **115 days remaining**. Initiate discussions within the next 30 days.\n\nEstimated total revenue at risk if unleased: **AED 76,500/mo**.",
  maint:
    "You have **5 open maintenance requests** across the portfolio — 2 rated **High priority**.\n\nHigh priority:\n— MNT-0042: Plumbing leak at Central Retail Plaza, Shop 9 (logged 24 Apr). Escalate to contractor today.\n— MNT-0044: Loading dock door at Al Quoz Warehouse A (logged 25 Apr). Safety risk — urgent.\n\nIn progress:\n— MNT-0041: Greenfield AC service, assigned to CoolTech Services.",
  occ:
    "Portfolio occupancy: **79% average** across 13 leasable units.\n\n— Greenfield Residences: 100% ✓ Fully occupied\n— Central Retail Plaza: 80% (4/5 units)\n— Horizon Office Tower: 75% (3/4 units)\n— Al Quoz Warehouse A: 67% (2/3 units)\n\nFilling the vacant warehouse bay could add an estimated **AED 9,500/mo** to revenue.",
  overdue:
    "There is **1 overdue payment** on record:\n\n— TXN-2607: Gulf Logistics, Al Quoz Warehouse A, **AED 14,000** due 07 Apr 2026 (20 days overdue).\n\nRecommendation: Issue a formal payment reminder today. Per lease terms, a 5% late fee of AED 700 may apply after 30 days.",
  default:
    "Hello Khaled! I have full context on your Dubai portfolio — 4 properties, 13 units, **AED 150,500** monthly revenue.\n\nHere are some things you can ask me:\n— What is my total rental income this month?\n— Which leases are approaching expiry?\n— Are there any urgent maintenance issues?\n— What is my current portfolio occupancy?\n— Any overdue payments?",
};

export function aiReply(q) {
  const t = q.toLowerCase();
  if (t.match(/income|revenue|rent|money|earn|collect/)) return AI_KB.income;
  if (t.match(/expir|lease|renew|upcoming/))             return AI_KB.expiry;
  if (t.match(/maint|repair|issue|request|fix/))         return AI_KB.maint;
  if (t.match(/occup|vacant|empty|fill/))                return AI_KB.occ;
  if (t.match(/overdue|late|unpaid|miss/))               return AI_KB.overdue;
  return AI_KB.default;
}
