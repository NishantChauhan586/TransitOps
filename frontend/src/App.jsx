import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";
import {
  LayoutDashboard, Bus, Users, Ticket,
  Plus, X, ArrowRight, AlertTriangle, CheckCircle2,
  LogOut, Menu, Crown, Eye, EyeOff, Edit, Trash2,
  UserPlus, Wrench, BarChart2, ShieldCheck, Zap,
} from "lucide-react";

/* ---------------------------------------------------------------
   API Service
--------------------------------------------------------------- */
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("transit_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(new Error(e.response?.data?.message || e.message || "Request failed"))
);

/* ---------------------------------------------------------------
   Design Tokens
--------------------------------------------------------------- */
const C = {
  royal:        "#030a29",
  royalSoft:    "#182757",
  royalLine:    "#2B3A76",
  royalMid:     "#1E3A8A",
  royalMidDark: "#152C68",
  canvas:       "#F0EEE4",
  surface:      "#FFFFFF",
  line:         "#E7E1D2",
  textPrimary:  "#181C2E",
  textMuted:    "#6B7280",
  gold:         "#C6A34D",
  goldSoft:     "#F4E6C1",
  goldDeep:     "#8A6A22",
  green:        "#1F8F5D",
  greenSoft:    "#E4F4EB",
  blue:         "#3E64B1",
  blueSoft:     "#E8EDFA",
  red:          "#D6483F",
  redSoft:      "#FBEAEA",
  neutral:      "#EBE8DE",
};

/* ---------------------------------------------------------------
   Global CSS
--------------------------------------------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; }
    .to-root { font-family:'Inter',system-ui,sans-serif; color:${C.textPrimary}; color-scheme:light; }
    .to-root * { color-scheme:light; }
    .to-root button { font-family:inherit; cursor:pointer; }
    .to-mono { font-family:'IBM Plex Mono',monospace; }
    .to-serif { font-family:'Cormorant Garamond',serif; }

    .to-scroll::-webkit-scrollbar { width:5px; height:5px; }
    .to-scroll::-webkit-scrollbar-thumb { background:#CCC8B8; border-radius:4px; }

    .to-root button:focus-visible,
    .to-root [tabindex]:focus-visible { outline:2px solid ${C.gold}; outline-offset:2px; border-radius:4px; }

    /* KPI tile */
    .to-flip {
      background:linear-gradient(160deg,${C.royal},#0B1330 120%);
      border-radius:8px;
      border:1px solid rgba(198,163,77,0.18);
      box-shadow:inset 0 -2px 0 rgba(255,255,255,0.05),0 4px 12px rgba(16,27,69,0.18);
      position:relative; overflow:hidden;
    }
    .to-flip::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(180deg,rgba(255,255,255,0.05),transparent 40%);
      pointer-events:none;
    }
    .to-flip-val { font-family:'IBM Plex Mono',monospace; color:#fff; letter-spacing:.5px; }
    .to-flip-lbl { color:rgba(255,255,255,0.5); font-size:9px; letter-spacing:.8px; margin-top:4px; }

    /* Buttons */
    .to-btn-primary {
      background:linear-gradient(135deg,${C.royalMid},${C.royalMidDark});
      color:#fff !important; border:1px solid rgba(198,163,77,0.35);
      transition:transform .15s,box-shadow .15s;
    }
    .to-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 16px rgba(30,58,138,.28); }
    .to-btn-primary:active:not(:disabled) { transform:translateY(0); }
    .to-btn-primary:disabled { background:#AEB4C7; border-color:transparent; cursor:not-allowed; opacity:.7; }

    .to-btn-ghost { background:#fff; border:1px solid ${C.line}; color:${C.textPrimary}; transition:all .15s; }
    .to-btn-ghost:hover { border-color:${C.gold}; background:#FBF8EF; transform:translateY(-1px); }

    .to-btn-danger { background:#fff; border:1px solid ${C.line}; color:${C.textPrimary}; transition:all .15s; }
    .to-btn-danger:hover { border-color:${C.red}; color:${C.red}; background:${C.redSoft}; }

    /* Badge */
    .to-badge { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.3px; display:inline-block; }

    /* Table rows */
    .to-row { transition:background .12s; }
    .to-row:hover { background:#FAF8F0; }

    /* Card */
    .to-card { background:${C.surface}; border:1px solid ${C.line}; box-shadow:0 1px 2px rgba(16,27,69,.03); }

    /* Inputs */
    input.to-input, select.to-input, textarea.to-input {
      border:1px solid ${C.line}; border-radius:7px; padding:9px 11px;
      font-size:14px; font-family:'Inter',sans-serif; width:100%;
      outline:none; background:#fff; color:${C.textPrimary}; color-scheme:light;
      transition:border-color .15s,box-shadow .15s;
    }
    input.to-input::placeholder, textarea.to-input::placeholder { color:#9AA3B2; }
    input.to-input:focus, select.to-input:focus, textarea.to-input:focus {
      border-color:${C.royalMid}; box-shadow:0 0 0 3px rgba(30,58,138,.1);
    }

    /* Layout */
    .to-shell { display:flex; min-height:100vh; background:${C.canvas}; overflow:hidden; flex-direction:row; }
    .to-topbar {
      display:none; align-items:center; justify-content:space-between;
      padding:12px 16px; background:${C.royal};
      border-bottom:1px solid ${C.royalLine}; position:sticky; top:0; z-index:40; width:100%;
    }
    .to-hamburger {
      background:rgba(255,255,255,.06); border:1px solid rgba(198,163,77,.35);
      border-radius:7px; width:36px; height:36px;
      display:flex; align-items:center; justify-content:center; color:${C.gold};
    }
    .to-sidebar {
      width:160px; background:${C.royal};
      display:flex; flex-direction:column; flex-shrink:0;
      border-right:1px solid ${C.royalLine}; height:100vh; position:sticky; top:0;
    }
    .to-overlay { display:none; position:fixed; inset:0; background:rgba(8,12,30,.55); z-index:45; }
    .to-main { flex:1; overflow-y:auto; padding:28px 28px 20px; min-width:0; height:100vh; }

    /* Nav */
    .to-nav-item {
      display:flex; align-items:center; gap:9px;
      padding:9px 12px; border-radius:6px; cursor:pointer; margin-bottom:1px;
      transition:background .15s,color .15s;
      color:#8A95B8; font-size:12.5px; font-weight:500; position:relative;
    }
    .to-nav-item:hover:not(.disabled) { background:${C.royalSoft}; color:#fff; }
    .to-nav-item.active { background:${C.royalSoft}; color:#fff; font-weight:700; }
    .to-nav-item.active::before {
      content:''; position:absolute; left:-8px; top:8px; bottom:8px;
      width:3px; background:${C.gold}; border-radius:3px;
    }
    .to-nav-item.disabled { opacity:.4; cursor:default; }

    /* KPI grid */
    .to-kpi-row {
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:10px; margin-bottom:20px;
    }

    /* Dashboard two-col */
    .to-dash-grid { display:grid; grid-template-columns:1.25fr 1fr; gap:16px; }

    /* Form grids */
    .to-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

    /* Tables */
    .to-table-wrap { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
    .to-table { width:100%; border-collapse:collapse; font-size:13px; min-width:580px; }
    .to-table th {
      padding:9px 14px; font-size:10.5px; font-weight:700;
      color:${C.textMuted}; letter-spacing:.3px;
      background:#FAF8F0; text-align:left;
    }
    .to-table td { padding:9px 14px; border-top:1px solid ${C.line}; }

    /* Animations */
    .to-fade-in { animation:toFade .22s ease; }
    @keyframes toFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .to-spinner {
      width:24px; height:24px;
      border:3px solid rgba(198,163,77,.18); border-top-color:${C.gold};
      border-radius:50%; animation:spin .75s linear infinite;
      display:inline-block; flex-shrink:0;
    }

    /* Responsive */
    @media(max-width:960px){
      .to-topbar{display:flex;}
      .to-shell{flex-direction:column;}
      .to-sidebar{
        position:fixed;top:0;left:0;bottom:0;z-index:50;
        transform:translateX(-104%);width:min(75vw,220px);
        box-shadow:12px 0 40px rgba(0,0,0,.35);
      }
      .to-overlay.open{display:block;}
      .to-main{padding:16px;height:auto;overflow:visible;}
      .to-kpi-row{grid-template-columns:repeat(4,1fr);}
    }
    @media(max-width:760px){ .to-dash-grid{grid-template-columns:1fr;} }
    @media(max-width:600px){
      .to-grid-2{grid-template-columns:1fr;}
      .to-kpi-row{grid-template-columns:repeat(2,1fr);}
    }
    @media(max-width:480px){
      .to-section-header{flex-direction:column;align-items:flex-start!important;gap:10px;}
    }
  `}</style>
);

/* ---------------------------------------------------------------
   Navigation
--------------------------------------------------------------- */
const NAV = [
  { key: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { key: "buses",       label: "Vehicles",         icon: Bus             },
  { key: "drivers",     label: "Drivers",          icon: Users           },
  { key: "tickets",     label: "Trips",            icon: Ticket          },
  { key: "maintenance", label: "Maintenance",      icon: Wrench,     disabled: true },
  { key: "fuel",        label: "Fuel & Expenses",  icon: Zap,        disabled: true },
  { key: "reports",     label: "Reports",          icon: BarChart2,  disabled: true },
  { key: "compliance",  label: "Compliance",       icon: ShieldCheck, disabled: true },
];

/* ---------------------------------------------------------------
   Shared Primitives
--------------------------------------------------------------- */
function StatusBadge({ status }) {
  const map = {
    Active:      { bg: C.greenSoft, fg: C.green },
    Available:   { bg: C.greenSoft, fg: C.green },
    Inactive:    { bg: C.redSoft,   fg: C.red   },
    Maintenance: { bg: C.goldSoft,  fg: C.goldDeep },
    "On Trip":   { bg: C.blueSoft,  fg: C.blue  },
    "Off Duty":  { bg: C.neutral,   fg: C.textMuted },
    Suspended:   { bg: C.redSoft,   fg: C.red   },
    Confirmed:   { bg: C.greenSoft, fg: C.green },
    Booked:      { bg: C.greenSoft, fg: C.green },
    Cancelled:   { bg: C.redSoft,   fg: C.red   },
    Completed:   { bg: C.blueSoft,  fg: C.blue  },
    Pending:     { bg: C.goldSoft,  fg: C.goldDeep },
    Paid:        { bg: C.greenSoft, fg: C.green },
    Unpaid:      { bg: C.redSoft,   fg: C.red   },
    Failed:      { bg: C.redSoft,   fg: C.red   },
    Draft:       { bg: C.neutral,   fg: C.textMuted },
  };
  const col = map[status] || { bg: C.neutral, fg: C.textMuted };
  return (
    <span className="to-badge"
      style={{ background: col.bg, color: col.fg, padding: "3px 8px", borderRadius: 999 }}>
      {(status || "—").toUpperCase()}
    </span>
  );
}

function KPITile({ label, value, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const num = parseFloat(value) || 0;
    const obj = { v: 0 };
    gsap.fromTo(el, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.38, ease: "back.out(1.5)" });
    gsap.to(obj, { v: num, duration: 0.65, ease: "power2.out",
      onUpdate: () => { if (el) el.textContent = `${Number.isInteger(num) ? Math.round(obj.v) : obj.v.toFixed(0)}${suffix}`; },
    });
  }, [value, suffix]);
  return (
    <div className="to-flip" style={{ padding: "14px 14px 12px" }}>
      <div ref={ref} className="to-flip-val" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
        {value}{suffix}
      </div>
      <div className="to-flip-lbl">{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children, width = 500 }) {
  const backdrop = useRef(null);
  const card = useRef(null);
  useLayoutEffect(() => {
    gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
    gsap.fromTo(card.current, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "power3.out" });
  }, []);
  const close = () => {
    gsap.to(card.current, { opacity: 0, y: 10, scale: 0.97, duration: 0.14 });
    gsap.to(backdrop.current, { opacity: 0, duration: 0.14, delay: 0.02, onComplete: onClose });
  };
  return (
    <div ref={backdrop} onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(9,13,32,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }}>
      <div ref={card} onClick={e => e.stopPropagation()} className="to-card"
        style={{ width, maxWidth: "100%", borderRadius: 12, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.line}`, background: "#FAF8F2", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{title}</h3>
          <button onClick={close} style={{ border: "none", background: "none", color: C.textMuted, padding: 3, display: "flex", borderRadius: 5 }}><X size={17} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.textMuted, marginBottom: 5 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "38px 20px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>
      <AlertTriangle size={22} style={{ marginBottom: 8, opacity: .38 }} />
      <div>{text}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="to-section-header"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
    </div>
  );
}

function ActionButton({ children, onClick, icon: Icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="to-btn-primary"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700 }}>
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function Spinner() { return <span className="to-spinner" />; }
function LoadingBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 10 }}>
      <Spinner />
      <div style={{ fontSize: 13, color: C.textMuted }}>Loading…</div>
    </div>
  );
}



function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ---------------------------------------------------------------
   Donut Chart
--------------------------------------------------------------- */
function DonutChart({ segments }) {
  const r = 44, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  const arcs = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const off  = -(cum / 100) * circ;
    cum += s.pct;
    return { ...s, dash, gap, off };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.neutral} strokeWidth="20" />
        {arcs.map(a => (
          <circle key={a.label} cx={cx} cy={cy} r={r}
            fill="none" stroke={a.color} strokeWidth="20"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.off}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray .8s ease" }} />
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center" }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: C.textMuted }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Main App
--------------------------------------------------------------- */
export default function TransitOpsApp() {
  const [token,       setToken]       = useState(() => localStorage.getItem("transit_token") || null);
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem("transit_token"));
  const [authView,    setAuthView]    = useState("login");

  const [stats,      setStats]      = useState(null);
  const [buses,      setBuses]      = useState([]);
  const [routes,     setRoutes]     = useState([]);
  const [drivers,    setDrivers]    = useState([]);
  const [tickets,    setTickets]    = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [view,    setView]    = useState("dashboard");
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const loginRef   = useRef(null);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const toastRef   = useRef(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!token) { setAuthLoading(false); return; }
    api.get("/auth/profile")
      .then(d => setUser(d.data))
      .catch(() => { localStorage.removeItem("transit_token"); setToken(null); })
      .finally(() => setAuthLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { if (token && user) fetchAll(); }, [token, user]); // eslint-disable-line

  const fetchAll = async () => {
    setDataLoading(true);
    try {
      const [s, b, r, d, t] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/buses"),
        api.get("/routes"),
        api.get("/drivers"),
        api.get("/tickets"),
      ]);
      setStats(s.data);
      setBuses(b.data);
      setRoutes(r.data);
      setDrivers(d.data);
      setTickets(t.data);
    } catch (err) { showToast(err.message, "err"); }
    finally { setDataLoading(false); }
  };

  useLayoutEffect(() => {
    if (!token && loginRef.current) {
      gsap.fromTo(loginRef.current.querySelectorAll(".anim-in"),
        { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out" });
    }
  }, [token, authView]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(el.querySelectorAll(".to-card,.to-flip"),
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power2.out", delay: 0.04 });
    }, el);
    return () => ctx.revert();
  }, [view, token]);

  useEffect(() => {
    if (!sidebarRef.current) return;
    if (navOpen) {
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.2 });
      gsap.to(sidebarRef.current, { xPercent: 0, duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.2 });
      gsap.to(sidebarRef.current, { xPercent: -104, duration: 0.26, ease: "power2.in" });
    }
  }, [navOpen]);

  useEffect(() => {
    if (toast && toastRef.current)
      gsap.fromTo(toastRef.current, { opacity: 0, y: -10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.7)" });
  }, [toast]);

  /* Auth */
  const handleLogin = async (email, password) => {
    const d = await api.post("/auth/login", { email, password });
    localStorage.setItem("transit_token", d.data.token);
    setToken(d.data.token);
    setUser({ _id: d.data._id, name: d.data.name, email: d.data.email, role: d.data.role });
  };
  const handleRegister = async (name, email, password) => {
    const d = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("transit_token", d.data.token);
    setToken(d.data.token);
    setUser({ _id: d.data._id, name: d.data.name, email: d.data.email, role: d.data.role });
  };
  const handleLogout = () => {
    localStorage.removeItem("transit_token");
    setToken(null); setUser(null);
    setStats(null); setBuses([]); setRoutes([]); setDrivers([]); setTickets([]);
  };

  /* CRUD */
  const c = {
    createBus:    async p => { await api.post("/buses", p);           await fetchAll(); showToast("Vehicle registered"); },
    updateBus:    async (id, p) => { await api.put(`/buses/${id}`, p); await fetchAll(); showToast("Vehicle updated"); },
    deleteBus:    async id => { await api.delete(`/buses/${id}`);      await fetchAll(); showToast("Vehicle deleted"); },
    createDriver: async p => { await api.post("/drivers", p);           await fetchAll(); showToast("Driver added"); },
    updateDriver: async (id, p) => { await api.put(`/drivers/${id}`, p); await fetchAll(); showToast("Driver updated"); },
    deleteDriver: async id => { await api.delete(`/drivers/${id}`);      await fetchAll(); showToast("Driver deleted"); },
    createTicket: async p => { await api.post("/tickets", p);            await fetchAll(); showToast("Trip booked"); },
    updateTicket: async (id, p) => { await api.put(`/tickets/${id}`, p); await fetchAll(); showToast("Trip updated"); },
    deleteTicket: async id => { await api.delete(`/tickets/${id}`);      await fetchAll(); showToast("Trip deleted"); },
  };

  const del = (fn, id, msg) => async () => {
    if (!window.confirm(msg)) return;
    try { await fn(id); } catch (e) { showToast(e.message, "err"); }
  };

  /* Loading */
  if (authLoading) return (
    <div className="to-root" style={{ minHeight: "100vh", background: C.royal, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyle /><Spinner />
    </div>
  );

  if (!token || !user) {
    return authView === "login"
      ? <LoginView loginRef={loginRef} onLogin={handleLogin} onSwitch={() => setAuthView("signup")} />
      : <SignupView loginRef={loginRef} onRegister={handleRegister} onSwitch={() => setAuthView("login")} />;
  }

  return (
    <div className="to-root to-fade-in to-shell">
      <GlobalStyle />

      {/* Mobile topbar */}
      <div className="to-topbar">
        <button className="to-hamburger" onClick={() => setNavOpen(true)} aria-label="Open nav"><Menu size={17} /></button>
        <div className="to-mono" style={{ color: C.gold, fontSize: 11, letterSpacing: "1.5px" }}>TRANSITOPS</div>
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay */}
      <div ref={overlayRef} className={`to-overlay${navOpen ? " open" : ""}`}
        style={{ opacity: 0, visibility: "hidden" }} onClick={() => setNavOpen(false)} />

      {/* Sidebar */}
      <nav ref={sidebarRef} className="to-sidebar">
        {/* Brand */}
        <div style={{ padding: "18px 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Crown size={13} color={C.gold} />
            <span className="to-mono" style={{ color: C.gold, fontSize: 11, letterSpacing: "1.5px" }}>TRANSITOPS</span>
          </div>
          <div style={{ color: "#5C6A8F", fontSize: 10, marginTop: 3 }}>Dispatch Console</div>
        </div>

        {/* Nav items */}
        <div className="to-scroll" style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          {NAV.map(n => {
            const Icon = n.icon;
            const isPlaceholder = n.placeholder;
            return (
              <div key={n.key}
                onClick={() => { if (!n.disabled) { setView(n.key); setNavOpen(false); } }}
                className={`to-nav-item${view === n.key ? " active" : ""}${n.disabled ? " disabled" : ""}`}>
                <Icon size={13} /><span>{n.label}</span>
              </div>
            );
          })}
        </div>

        {/* User footer */}
        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${C.royalLine}` }}>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{user.name}</div>
          <div style={{ fontSize: 10, color: "#5C6A8F", marginTop: 1 }}>{user.role || "Fleet Manager"}</div>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, color: "#8A95B8", fontSize: 11, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="to-scroll to-main" ref={contentRef} key={view}>
        {toast && (
          <div ref={toastRef} style={{
            position: "fixed", top: 20, right: 20, zIndex: 80,
            padding: "10px 16px", borderRadius: 9,
            background: toast.kind === "err" ? "#3A1F1D" : C.royal,
            color: "#fff", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,.3)",
            border: `1px solid ${toast.kind === "err" ? "rgba(214,72,63,.4)" : "rgba(198,163,77,.3)"}`,
            maxWidth: "calc(100vw - 40px)",
          }}>
            {toast.kind === "err" ? <AlertTriangle size={13} color={C.red} /> : <CheckCircle2 size={13} color={C.gold} />}
            {toast.msg}
          </div>
        )}

        {view === "dashboard"   && <DashboardView stats={stats} drivers={drivers} buses={buses} tickets={tickets} routes={routes} user={user} loading={dataLoading} />}
        {view === "buses"       && <BusesView buses={buses} routes={routes} crud={c} setModal={setModal} showToast={showToast} loading={dataLoading} del={del} />}
        {view === "drivers"     && <DriversView drivers={drivers} crud={c} setModal={setModal} showToast={showToast} loading={dataLoading} del={del} />}
        {view === "tickets"     && <TicketsView tickets={tickets} buses={buses} routes={routes} crud={c} setModal={setModal} showToast={showToast} loading={dataLoading} del={del} />}

      </div>

      {/* Modals */}
      {modal?.type === "bus-form" && (
        <Modal title={modal.data ? "Edit Vehicle" : "Register Vehicle"} onClose={() => setModal(null)} width={520}>
          <BusForm initial={modal.data} routes={routes}
            onSubmit={async p => { try { modal.data ? await c.updateBus(modal.data._id, p) : await c.createBus(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "driver-form" && (
        <Modal title={modal.data ? "Edit Driver" : "Add Driver"} onClose={() => setModal(null)}>
          <DriverForm initial={modal.data}
            onSubmit={async p => { try { modal.data ? await c.updateDriver(modal.data._id, p) : await c.createDriver(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
      {modal?.type === "ticket-form" && (
        <Modal title={modal.data ? "Edit Trip" : "Book Trip"} onClose={() => setModal(null)} width={560}>
          <TicketForm initial={modal.data} buses={buses} routes={routes}
            onSubmit={async p => { try { modal.data ? await c.updateTicket(modal.data._id, p) : await c.createTicket(p); setModal(null); } catch (e) { showToast(e.message, "err"); } }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Auth Screens
--------------------------------------------------------------- */
/* Roles shown on login */
const LOGIN_ROLES = [
  { key: "fleet",     label: "Fleet Manager",   modules: 6 },
  { key: "driver",    label: "Driver",          modules: 2 },
  { key: "safety",    label: "Safety Officer",  modules: 4 },
  { key: "financial", label: "Financial Analyst", modules: 4 },
];

function AuthShell({ loginRef, children }) {
  return (
    <div ref={loginRef} className="to-root"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 120% 80% at 50% 0%, #0D1F6E 0%, #030a29 55%, #02081A 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}>
      <GlobalStyle />
      {children}
    </div>
  );
}

function ErrAlert({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 7, background: C.redSoft, color: C.red, fontSize: 13, marginBottom: 14, border: `1px solid rgba(214,72,63,.2)` }}>
      <AlertTriangle size={13} />{msg}
    </div>
  );
}

function PwInput({ value, onChange, show, toggle, placeholder = "••••••••" }) {
  return (
    <div style={{ position: "relative" }}>
      <input className="to-input" type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ paddingRight: 36 }} autoComplete="off" />
      <button type="button" onClick={toggle}
        style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: C.textMuted, display: "flex", cursor: "pointer", padding: 2 }}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function LoginView({ loginRef, onLogin, onSwitch }) {
  const [email,    setEmail]    = useState("ops@transitops.com");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("fleet");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try { await onLogin(email, password); }
    catch (err) { setError(err.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell loginRef={loginRef}>
      {/* Brand */}
      <div className="anim-in" style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
          <Crown size={13} color={C.gold} />
          <span className="to-mono" style={{ color: C.gold, fontSize: 11.5, letterSpacing: "2px" }}>TRANSITOPS // CONSOLE</span>
        </div>
        <div className="to-serif" style={{ color: "#fff", fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>Sign in to operations</div>
        <div style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginTop: 6 }}>Select your role to enter the console.</div>
      </div>

      {/* Card */}
      <div className="anim-in" style={{
        background: "#fff", borderRadius: 16,
        padding: "26px 26px 22px", width: "100%", maxWidth: 400,
        boxShadow: "0 32px 80px rgba(0,0,0,.45)",
      }}>
        {error && <ErrAlert msg={error} />}
        <form onSubmit={submit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: ".5px", marginBottom: 5 }}>Email</label>
            <input className="to-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ops@transitops.com" autoComplete="email" />
          </div>
          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: ".5px", marginBottom: 5 }}>Password</label>
            <input className="to-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {/* Role selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "1px", marginBottom: 9 }}>ROLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {LOGIN_ROLES.map(r => {
                const active = role === r.key;
                return (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)}
                    style={{
                      padding: "11px 13px", borderRadius: 9, textAlign: "left", cursor: "pointer",
                      border: `1px solid ${active ? C.royalMid : C.line}`,
                      background: active ? C.royal : "#fff",
                      transition: "all .15s",
                    }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? "#fff" : C.textPrimary }}>{r.label}</div>
                    <div style={{ fontSize: 10.5, marginTop: 2, color: active ? "rgba(255,255,255,.5)" : C.textMuted }}>{r.modules} modules</div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Submit */}
          <button type="submit" disabled={loading} className="to-btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 700 }}>
            {loading ? <><Spinner />&nbsp;Signing in…</> : <><ArrowRight size={14} />Sign In</>}
          </button>
        </form>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: C.textMuted }}>
          Don't have an account?{" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.royalMid, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Sign up</button>
        </div>
      </div>
    </AuthShell>
  );
}

function SignupView({ loginRef, onRegister, onSwitch }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try { await onRegister(name, email, password); }
    catch (err) { setError(err.message || "Registration failed"); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell loginRef={loginRef}>
      <div className="to-card anim-in" style={{ borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <div className="to-serif" style={{ fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Create account</div>
        <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 18 }}>Register to access the console</div>
        {error && <ErrAlert msg={error} />}
        <form onSubmit={submit}>
          <Field label="Full Name" required>
            <input className="to-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" autoComplete="name" />
          </Field>
          <Field label="Email Address" required>
            <input className="to-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@transitops.com" autoComplete="email" />
          </Field>
          <div className="to-grid-2">
            <Field label="Password" required>
              <PwInput value={password} onChange={setPassword} show={showPw} toggle={() => setShowPw(v => !v)} placeholder="Min. 6 chars" />
            </Field>
            <Field label="Confirm Password" required>
              <PwInput value={confirm} onChange={setConfirm} show={showPw} toggle={() => setShowPw(v => !v)} placeholder="Repeat password" />
            </Field>
          </div>
          <button type="submit" disabled={loading} className="to-btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>
            {loading ? <><Spinner />&nbsp;Creating account…</> : <><UserPlus size={14} />Create Account</>}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12.5, color: C.textMuted }}>
          Already have an account?{" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.royalMid, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Sign in</button>
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------------------------------------------------------------
   Dashboard
--------------------------------------------------------------- */
function DashboardView({ stats, drivers, buses, tickets, routes, user, loading }) {
  if (loading || !stats) return <LoadingBlock />;

  const driversOnDuty  = drivers.filter(d => d.status === "On Trip").length;
  const activeTrips    = tickets.filter(t => t.status === "Booked").length;
  const pendingTrips   = tickets.filter(t => t.status !== "Booked" && t.status !== "Completed" && t.status !== "Cancelled").length;
  const fleetUtil      = stats.totalBuses > 0 ? Math.round((stats.activeBuses / stats.totalBuses) * 100) : 0;

  const recentTrips = [...tickets]
    .sort((a, b) => new Date(b.bookingDate || b.createdAt) - new Date(a.bookingDate || a.createdAt))
    .slice(0, 6);

  // Donut segments based on fleet region
  const byRegion = stats.byRegion || {};
  const regionTotal = Object.values(byRegion).reduce((a, v) => a + v, 0) || 1;
  const REGION_COLORS = { East: C.green, North: C.royalMid, South: C.royal, West: C.gold };
  const donutData = Object.entries(byRegion)
    .map(([label, count]) => ({ label, pct: Math.round((count / regionTotal) * 100), color: REGION_COLORS[label] || C.neutral }))
    .filter(s => s.pct > 0);

  // Ensure exactly 100%
  if (donutData.length === 0) donutData.push({ label: "No data", pct: 100, color: C.neutral });
  else {
    const diff = 100 - donutData.reduce((a, s) => a + s.pct, 0);
    if (diff !== 0) donutData[0].pct += diff;
  }

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Fleet Manager";

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle={`Welcome back — viewing as ${roleLabel}`} />

      {/* KPI row */}
      <div className="to-kpi-row">
        <KPITile label="ACTIVE VEHICLES"  value={stats.activeBuses} />
        <KPITile label="AVAILABLE"        value={stats.activeBuses - driversOnDuty < 0 ? 0 : stats.activeBuses - driversOnDuty} />
        <KPITile label="IN MAINTENANCE"   value={stats.maintenanceBuses} />
        <KPITile label="ACTIVE TRIPS"     value={activeTrips} />
        <KPITile label="PENDING TRIPS"    value={pendingTrips} />
        <KPITile label="DRIVERS ON DUTY"  value={driversOnDuty} />
        <KPITile label="FLEET UTILIZATION" value={fleetUtil} suffix="%" />
      </div>

      {/* Two-column grid */}
      <div className="to-dash-grid">
        {/* Recent trips */}
        <div className="to-card" style={{ borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>Recent trips</div>
          {recentTrips.length === 0 ? (
            <EmptyState text="No trips found. Book your first trip." />
          ) : (
            <div>
              {recentTrips.map((t, i) => {
                const bus   = buses.find(b => b._id === (t.bus?._id || t.bus));
                const route = routes.find(r => r._id === (t.route?._id || t.route));
                const from  = route?.source || bus?.busNumber || "Origin";
                const to    = route?.destination || bus?.busName || "Destination";
                const label = t.status === "Booked" ? "Booked"
                  : t.status === "Completed" ? "Completed"
                  : t.status === "Cancelled" ? "Cancelled" : "Draft";
                return (
                  <div key={t._id || i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < recentTrips.length - 1 ? `1px solid ${C.line}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {from} <ArrowRight size={11} style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }} /> {to}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                        {t.passenger?.name || "Passenger"} · Seat {t.seatNumber} · ₹{t.fare}
                      </div>
                    </div>
                    <StatusBadge status={label} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fleet by region */}
        <div className="to-card" style={{ borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}>Fleet by region</div>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <DonutChart segments={donutData} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Vehicles View
--------------------------------------------------------------- */
function BusesView({ buses, routes, crud, setModal, showToast, loading, del }) {
  return (
    <div>
      <SectionHeader title="Vehicles" subtitle={`${buses.length} vehicles registered`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "bus-form", data: null })}>Add Vehicle</ActionButton>} />
      {loading ? <LoadingBlock /> : (
        <div className="to-card to-table-wrap" style={{ borderRadius: 10 }}>
          <table className="to-table">
            <thead><tr>
              {["Bus No.", "Name", "Capacity", "Driver", "Route", "Region", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {buses.length === 0
                ? <tr><td colSpan={7}><EmptyState text="No vehicles. Click Add Vehicle." /></td></tr>
                : buses.map(b => {
                    const rt = routes.find(r => r._id === (b.route?._id || b.route));
                    return (
                      <tr key={b._id} className="to-row">
                        <td className="to-mono"><strong>{b.busNumber}</strong></td>
                        <td>{b.busName}</td>
                        <td>{b.capacity} seats</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.driverName || "—"}</div>
                          {b.driverPhone && <div style={{ fontSize: 10.5, color: C.textMuted }}>{b.driverPhone}</div>}
                        </td>
                        <td>{rt ? <span style={{ color: C.royalMid, fontWeight: 600 }}>{rt.routeNumber}</span> : <span style={{ color: C.textMuted }}>—</span>}</td>
                        <td>
                          {b.region && (
                            <span className="to-badge" style={{
                              padding: "3px 8px", borderRadius: 999,
                              background: { East: C.greenSoft, North: C.blueSoft, South: C.neutral, West: C.goldSoft }[b.region] || C.neutral,
                              color: { East: C.green, North: C.blue, South: C.textMuted, West: C.goldDeep }[b.region] || C.textMuted,
                            }}>{b.region}</span>
                          )}
                        </td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="to-btn-ghost" onClick={() => setModal({ type: "bus-form", data: b })} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Edit size={12} /></button>
                            <button className="to-btn-danger" onClick={del(crud.deleteBus, b._id, "Delete this vehicle?")} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Drivers View
--------------------------------------------------------------- */
function DriversView({ drivers, crud, setModal, loading, del }) {
  return (
    <div>
      <SectionHeader title="Drivers" subtitle={`${drivers.length} drivers on record`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "driver-form", data: null })}>Add Driver</ActionButton>} />
      {loading ? <LoadingBlock /> : (
        <div className="to-card to-table-wrap" style={{ borderRadius: 10 }}>
          <table className="to-table">
            <thead><tr>
              {["Name", "License No.", "Category", "Expiry", "Contact", "Safety Score", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {drivers.length === 0
                ? <tr><td colSpan={8}><EmptyState text="No drivers. Click Add Driver." /></td></tr>
                : drivers.map(d => {
                    const days = daysUntil(d.licenseExpiry);
                    return (
                      <tr key={d._id} className="to-row">
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td className="to-mono">{d.licenseNumber}</td>
                        <td>{d.licenseCategory}</td>
                        <td style={{ color: days < 0 ? C.red : days <= 30 ? C.goldDeep : C.textPrimary, whiteSpace: "nowrap" }}>
                          {fmtDate(d.licenseExpiry)}{days < 0 ? " (exp.)" : days <= 30 ? ` (${days}d)` : ""}
                        </td>
                        <td>{d.contactNumber}</td>
                        <td><span style={{ fontWeight: 700, color: d.safetyScore >= 80 ? C.green : d.safetyScore >= 60 ? C.goldDeep : C.red }}>{d.safetyScore}</span></td>
                        <td><StatusBadge status={d.status} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="to-btn-ghost" onClick={() => setModal({ type: "driver-form", data: d })} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Edit size={12} /></button>
                            <button className="to-btn-danger" onClick={del(crud.deleteDriver, d._id, "Delete this driver?")} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Trips View
--------------------------------------------------------------- */
function TicketsView({ tickets, buses, routes, crud, setModal, loading, del }) {
  return (
    <div>
      <SectionHeader title="Trips" subtitle={`${tickets.length} trips on record`}
        action={<ActionButton icon={Plus} onClick={() => setModal({ type: "ticket-form", data: null })}>Book Trip</ActionButton>} />
      {loading ? <LoadingBlock /> : (
        <div className="to-card to-table-wrap" style={{ borderRadius: 10 }}>
          <table className="to-table">
            <thead><tr>
              {["Ticket No.", "Bus", "Route", "Seat", "Fare", "Travel Date", "Status", "Payment", "Actions"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {tickets.length === 0
                ? <tr><td colSpan={9}><EmptyState text="No trips booked. Click Book Trip." /></td></tr>
                : tickets.map(t => (
                    <tr key={t._id} className="to-row">
                      <td className="to-mono"><strong>{t.ticketNo}</strong></td>
                      <td>{t.bus?.busNumber || "—"}</td>
                      <td>{t.route?.routeNumber || "—"}</td>
                      <td className="to-mono">{t.seatNumber}</td>
                      <td>₹{t.fare}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(t.travelDate)}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td><StatusBadge status={t.paymentStatus} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="to-btn-ghost" onClick={() => setModal({ type: "ticket-form", data: t })} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Edit size={12} /></button>
                          <button className="to-btn-danger" onClick={del(crud.deleteTicket, t._id, "Delete this trip?")} style={{ padding: "4px 7px", borderRadius: 5, display: "flex" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Forms
--------------------------------------------------------------- */
function useForm(initial) {
  const [f, setF] = useState(initial);
  const set  = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const setN = k => e => setF(p => ({ ...p, [k]: Number(e.target.value) }));
  return [f, setF, set, setN];
}

function SubmitBtn({ loading, label, icon: Icon }) {
  return (
    <div style={{ marginTop: 18 }}>
      <button type="submit" disabled={loading} className="to-btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700 }}>
        {loading ? <><Spinner />&nbsp;Saving…</> : <>{Icon && <Icon size={13} />} {label}</>}
      </button>
    </div>
  );
}

function BusForm({ initial, routes, onSubmit }) {
  const [f, , set, setN] = useForm({
    busNumber:   initial?.busNumber   || "",
    busName:     initial?.busName     || "",
    capacity:    initial?.capacity    || 35,
    driverName:  initial?.driverName  || "",
    driverPhone: initial?.driverPhone || "",
    route:       initial?.route?._id  || initial?.route || "",
    region:      initial?.region      || "North",
    status:      initial?.status      || "Active",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Bus Number" required><input className="to-input" value={f.busNumber} onChange={set("busNumber")} placeholder="MH-12-AB-1234" /></Field>
        <Field label="Vehicle Name" required><input className="to-input" value={f.busName} onChange={set("busName")} placeholder="Metro Express" /></Field>
      </div>
      <div className="to-grid-2">
        <Field label="Capacity (seats)" required><input className="to-input" type="number" min={1} value={f.capacity} onChange={setN("capacity")} /></Field>
        <Field label="Status">
          <select className="to-input" value={f.status} onChange={set("status")}>
            {["Active", "Inactive", "Maintenance"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Region">
          <select className="to-input" value={f.region} onChange={set("region")}>
            {["East", "North", "South", "West"].map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Driver Name"><input className="to-input" value={f.driverName} onChange={set("driverName")} /></Field>
      </div>
      <Field label="Driver Phone"><input className="to-input" value={f.driverPhone} onChange={set("driverPhone")} /></Field>
      <Field label="Assigned Route">
        <select className="to-input" value={f.route} onChange={set("route")}>
          <option value="">— None —</option>
          {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber} — {r.routeName}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Save Changes" : "Register Vehicle"} icon={Plus} />
    </form>
  );
}

function DriverForm({ initial, onSubmit }) {
  const [f, , set, setN] = useForm({
    name:            initial?.name            || "",
    licenseNumber:   initial?.licenseNumber   || "",
    licenseCategory: initial?.licenseCategory || "LMV",
    licenseExpiry:   initial?.licenseExpiry?.slice(0, 10) || "",
    contactNumber:   initial?.contactNumber   || "",
    safetyScore:     initial?.safetyScore     ?? 80,
    status:          initial?.status          || "Available",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Full Name" required><input className="to-input" value={f.name} onChange={set("name")} /></Field>
        <Field label="License Number" required><input className="to-input" value={f.licenseNumber} onChange={set("licenseNumber")} /></Field>
      </div>
      <div className="to-grid-2">
        <Field label="Category">
          <select className="to-input" value={f.licenseCategory} onChange={set("licenseCategory")}>
            {["LMV", "HMV", "HPMV", "PSV"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Expiry Date" required><input className="to-input" type="date" value={f.licenseExpiry} onChange={set("licenseExpiry")} /></Field>
      </div>
      <div className="to-grid-2">
        <Field label="Contact Number"><input className="to-input" value={f.contactNumber} onChange={set("contactNumber")} /></Field>
        <Field label="Safety Score (0–100)"><input className="to-input" type="number" min={0} max={100} value={f.safetyScore} onChange={setN("safetyScore")} /></Field>
      </div>
      <Field label="Status">
        <select className="to-input" value={f.status} onChange={set("status")}>
          {["Available", "On Trip", "Off Duty", "Suspended"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Save Changes" : "Add Driver"} />
    </form>
  );
}

function TicketForm({ initial, buses, routes, onSubmit }) {
  const [f, , set, setN] = useForm({
    passenger:     initial?.passenger?._id || initial?.passenger || "",
    bus:           initial?.bus?._id       || initial?.bus       || "",
    route:         initial?.route?._id     || initial?.route     || "",
    seatNumber:    initial?.seatNumber     || 1,
    fare:          initial?.fare           || "",
    travelDate:    initial?.travelDate?.slice(0, 10) || "",
    status:        initial?.status         || "Booked",
    paymentStatus: initial?.paymentStatus  || "Pending",
  });
  const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); await onSubmit(f); setLoading(false); };
  return (
    <form onSubmit={submit}>
      <div className="to-grid-2">
        <Field label="Bus" required>
          <select className="to-input" value={f.bus} onChange={set("bus")}>
            <option value="">— Select Bus —</option>
            {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber} — {b.busName}</option>)}
          </select>
        </Field>
        <Field label="Route">
          <select className="to-input" value={f.route} onChange={set("route")}>
            <option value="">— Select Route —</option>
            {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber} — {r.routeName}</option>)}
          </select>
        </Field>
      </div>
      <div className="to-grid-2">
        <Field label="Seat No." required><input className="to-input" type="number" min={1} value={f.seatNumber} onChange={setN("seatNumber")} /></Field>
        <Field label="Fare (₹)" required><input className="to-input" type="number" min={0} value={f.fare} onChange={setN("fare")} /></Field>
      </div>
      <div className="to-grid-2">
        <Field label="Travel Date" required><input className="to-input" type="date" value={f.travelDate} onChange={set("travelDate")} /></Field>
        <Field label="Status">
          <select className="to-input" value={f.status} onChange={set("status")}>
            {["Booked", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Payment Status">
        <select className="to-input" value={f.paymentStatus} onChange={set("paymentStatus")}>
          {["Paid", "Pending", "Failed"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <SubmitBtn loading={loading} label={initial ? "Update Trip" : "Book Trip"} />
    </form>
  );
}