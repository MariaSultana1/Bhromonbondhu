import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Calendar, DollarSign, AlertTriangle, LogOut,
  Bell, RefreshCw, TrendingUp, Shield, Loader2, Map,
  Phone, MapPin, Clock, CheckCircle, Battery, Wifi,
  X, Radio, Activity, Navigation, Zap, Eye
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function taka(n) {
  if (!n) return '৳0';
  if (n >= 1_000_000) return '৳' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '৳' + (n / 1_000).toFixed(1) + 'K';
  return '৳' + Math.round(n).toLocaleString();
}

function buildUserGrowth(users) {
  const now = new Date();
  const map = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] = { month: d.toLocaleString('default', { month: 'short' }), travelers: 0, hosts: 0 };
  }
  users.forEach(u => {
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[key]) return;
    u.role === 'host' ? map[key].hosts++ : map[key].travelers++;
  });
  let ct = 0, ch = 0;
  return Object.values(map).map(r => { ct += r.travelers; ch += r.hosts; return { ...r, travelers: ct, hosts: ch }; });
}

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAF8',
  border: '#E8E6E0',
  borderStrong: '#D4D0C8',
  text: '#1A1816',
  textSub: '#6B6760',
  textMuted: '#9B9890',
  accent: '#2563EB',
  accentLight: '#EEF3FD',
  green: '#059669',
  greenLight: '#ECFDF5',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  red: '#DC2626',
  redLight: '#FEF2F2',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  teal: '#0D9488',
  tealLight: '#F0FDFA',
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes sosPulse { 0%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 70%{box-shadow:0 0 0 14px rgba(220,38,38,0)} 100%{box-shadow:0 0 0 0 rgba(220,38,38,0)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; }
`;

// ─── SPINNER ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Loader2 size={24} color={T.accent} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// ─── TOOLTIPS ─────────────────────────────────────────────────────────────────
function RevTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Lato, sans-serif' }}>
      <p style={{ color: T.textSub, fontWeight: 700, marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>● {p.name}</span>
          <strong style={{ color: T.text, fontFamily: 'DM Mono, monospace' }}>৳{Number(p.value).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function UserTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Lato, sans-serif' }}>
      <p style={{ color: T.textSub, fontWeight: 700, marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>● {p.name}</span>
          <strong style={{ color: T.text }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, bgColor, value, label, sub, subColor, badge, loading }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22, transition: 'transform 0.2s, box-shadow 0.2s', fontFamily: 'Lato, sans-serif', animation: 'fadeIn 0.4s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.08)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bgColor || `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: bgColor || `${color}15`, color, fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>{badge}</span>}
      </div>
      {loading
        ? <div style={{ height: 32, background: T.bg, borderRadius: 6, marginBottom: 8 }} />
        : <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: 'DM Mono, monospace', letterSpacing: '-0.02em' }}>{value}</div>
      }
      <p style={{ color: T.textSub, fontSize: 13, marginBottom: sub ? 2 : 0, fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: subColor || T.textMuted }}>{sub}</p>}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, badge, children }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, fontFamily: 'Lato, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 3, fontFamily: 'Syne, sans-serif' }}>{title}</h3>
          {subtitle && <p style={{ color: T.textMuted, fontSize: 12 }}>{subtitle}</p>}
        </div>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: T.accentLight, color: T.accent, fontFamily: 'DM Mono, monospace' }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const IS = {
  padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`,
  background: T.surface, color: T.text, fontSize: 13, outline: 'none',
  flex: 1, minWidth: 160, fontFamily: 'Lato, sans-serif'
};
const BB = {
  marginBottom: 20, padding: '8px 18px', borderRadius: 8,
  border: `1px solid ${T.border}`, background: T.surface,
  color: T.textSub, cursor: 'pointer', fontSize: 13,
  fontFamily: 'Lato, sans-serif', fontWeight: 600,
  transition: 'all 0.15s'
};
const PAGE = {
  minHeight: '100vh',
  background: T.bg,
  fontFamily: "'Lato', 'Segoe UI', sans-serif"
};
const WRAP = { maxWidth: 1280, margin: '0 auto', padding: '28px 20px' };
const VAB = {
  marginTop: 14, width: '100%', padding: 10, borderRadius: 10,
  border: `1px solid ${T.border}`, background: T.bg,
  color: T.textSub, cursor: 'pointer', fontSize: 13,
  fontFamily: 'Lato, sans-serif', fontWeight: 600,
  transition: 'all 0.15s'
};

// ─── SOS MAP ─────────────────────────────────────────────────────────────────
function SosMap({ lat, lng, userName }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
      <iframe src={mapUrl} width="100%" height="220" style={{ border: 'none', display: 'block' }} title={`SOS location of ${userName}`} loading="lazy" />
      <div style={{ position: 'absolute', top: 8, left: 8, background: T.red, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Mono, monospace' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
        LIVE
      </div>
    </div>
  );
}

// ─── SOS MONITOR PANEL ───────────────────────────────────────────────────────
function SOSMonitorPanel({ token, onBack, sosAlerts, loadingSOS, refreshSOS }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const resolve = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      const r = await fetch(`${API_BASE}/admin/sos/${selected._id}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resolutionNotes: note || 'Resolved by admin' }),
      });
      if ((await r.json()).success) { setShowModal(false); setSelected(null); setNote(''); refreshSOS(); }
    } catch (e) { console.error(e); }
    setResolving(false);
  };

  const severityColor = (createdAt) => {
    const mins = (Date.now() - new Date(createdAt)) / 60000;
    if (mins < 5) return T.red;
    if (mins < 30) return T.amber;
    return '#CA8A04';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={onBack} style={BB}>← Back to Dashboard</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: T.redLight, border: `1px solid #FECACA` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.red, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: T.red, fontSize: 12, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
              {sosAlerts.length} ACTIVE ALERT{sosAlerts.length !== 1 ? 'S' : ''}
            </span>
          </div>
          <button onClick={refreshSOS} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.textSub, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Lato, sans-serif', fontWeight: 600 }}>
            <RefreshCw size={13} style={{ animation: loadingSOS ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      <h2 style={{ color: T.text, marginBottom: 4, fontWeight: 800, fontSize: 22, fontFamily: 'Syne, sans-serif' }}>SOS Emergency Monitor</h2>
      <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Auto-refreshes every 30 seconds · Live traveler tracking</p>

      {loadingSOS ? <Spinner /> : sosAlerts.length === 0 ? (
        <div style={{ background: T.greenLight, border: `1px solid #A7F3D0`, borderRadius: 16, padding: 60, textAlign: 'center' }}>
          <CheckCircle size={48} color={T.green} style={{ marginBottom: 16 }} />
          <p style={{ color: T.green, fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>All Clear — No Active Alerts</p>
          <p style={{ color: T.textMuted, fontSize: 13 }}>All travelers are safe. SOS alerts will appear here instantly.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '360px 1fr' : '1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sosAlerts.map(alert => {
              const age = Math.floor((Date.now() - new Date(alert.createdAt)) / 60000);
              const col = severityColor(alert.createdAt);
              const isSelected = selected?._id === alert._id;
              return (
                <div key={alert._id} onClick={() => setSelected(isSelected ? null : alert)}
                  style={{ background: isSelected ? T.redLight : T.surface, border: `1px solid ${isSelected ? '#FECACA' : T.border}`, borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all 0.2s', animation: age < 2 ? 'sosPulse 2s infinite' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${col}15`, border: `2px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={18} color={col} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: T.text, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{alert.userName}</p>
                        <p style={{ color: T.textSub, fontSize: 12, marginBottom: 6 }}>{alert.userEmail}</p>
                        {alert.tripInfo?.destination && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <Navigation size={10} color={T.accent} />
                            <span style={{ color: T.accent, fontSize: 11 }}>{alert.tripInfo.destination}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} color={T.textMuted} />
                          <span style={{ color: T.textMuted, fontSize: 11 }}>{timeAgo(alert.createdAt)}</span>
                          {age < 5 && <span style={{ marginLeft: 4, fontSize: 10, color: T.red, fontWeight: 700, background: T.redLight, padding: '1px 6px', borderRadius: 10, fontFamily: 'DM Mono, monospace' }}>NEW</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, marginTop: 4, animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                  </div>
                  <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={10} color={T.textMuted} />
                      <span style={{ color: T.textSub, fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{alert.location?.lat?.toFixed(4)}, {alert.location?.lng?.toFixed(4)}</span>
                    </div>
                    {alert.deviceInfo?.battery?.level && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Battery size={10} color={alert.deviceInfo.battery.level < 20 ? T.red : T.textMuted} />
                        <span style={{ color: alert.deviceInfo.battery.level < 20 ? T.red : T.textSub, fontSize: 11 }}>{alert.deviceInfo.battery.level}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Live Location</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://www.google.com/maps?q=${selected.location.lat},${selected.location.lng}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: T.accent, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.accentLight}`, background: T.accentLight, fontWeight: 600 }}>
                      Open in Google Maps ↗
                    </a>
                    <button onClick={() => setSelected(null)} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 8px', color: T.textSub, cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {selected.location?.lat && selected.location?.lng && <SosMap lat={selected.location.lat} lng={selected.location.lng} userName={selected.userName} />}
                {selected.location?.address && (
                  <p style={{ color: T.textSub, fontSize: 12, marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <MapPin size={12} color={T.textMuted} style={{ marginTop: 1, flexShrink: 0 }} />
                    {selected.location.address}
                  </p>
                )}
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>Emergency Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Full Name', value: selected.userName },
                    { label: 'Email', value: selected.userEmail },
                    { label: 'Phone', value: selected.userPhone || 'Not provided' },
                    { label: 'Alert Time', value: new Date(selected.createdAt).toLocaleTimeString() },
                    { label: 'Coordinates', value: `${selected.location?.lat?.toFixed(6)}, ${selected.location?.lng?.toFixed(6)}` },
                    { label: 'GPS Accuracy', value: selected.location?.accuracy ? `±${Math.round(selected.location.accuracy)}m` : 'Unknown' },
                    ...(selected.tripInfo?.destination ? [{ label: 'Destination', value: selected.tripInfo.destination }] : []),
                    ...(selected.tripInfo?.transportType ? [{ label: 'Transport', value: selected.tripInfo.transportType }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ color: T.textMuted, fontSize: 11, marginBottom: 4 }}>{label}</p>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {(selected.deviceInfo?.battery || selected.deviceInfo?.connection) && (
                  <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', gap: 20 }}>
                    {selected.deviceInfo?.battery?.level !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Battery size={14} color={selected.deviceInfo.battery.level < 20 ? T.red : T.green} />
                        <span style={{ color: selected.deviceInfo.battery.level < 20 ? T.red : T.textSub, fontSize: 12 }}>
                          {selected.deviceInfo.battery.level}% {selected.deviceInfo.battery.charging ? '⚡ Charging' : ''}
                        </span>
                      </div>
                    )}
                    {selected.deviceInfo?.connection && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Wifi size={14} color={T.green} />
                        <span style={{ color: T.textSub, fontSize: 12 }}>{selected.deviceInfo.connection}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={14} color={T.accent} />
                      <span style={{ color: T.accent, fontSize: 12 }}>Online</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                  {selected.userPhone && (
                    <a href={`tel:${selected.userPhone}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: T.accent, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>
                      <Phone size={15} />
                      Call Traveler
                    </a>
                  )}
                  <button onClick={() => setShowModal(true)}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: T.green, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Lato, sans-serif' }}>
                    <CheckCircle size={15} />
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          )}

          {!selected && sosAlerts.length > 0 && (
            <div style={{ background: T.surface, border: `2px dashed ${T.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
              <Eye size={36} color={T.borderStrong} style={{ marginBottom: 14 }} />
              <p style={{ color: T.textMuted, fontSize: 14 }}>Select an alert to view live location &amp; details</p>
            </div>
          )}
        </div>
      )}

      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
          <div style={{ background: T.surface, borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: T.text, fontFamily: 'Syne, sans-serif' }}>Resolve SOS Alert</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ color: T.textSub, fontSize: 13, marginBottom: 16 }}>Marking alert for <strong style={{ color: T.text }}>{selected.userName}</strong> as resolved</p>
            <textarea rows={4} placeholder="Resolution notes (optional)…" value={note} onChange={e => setNote(e.target.value)}
              style={{ ...IS, width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Lato, sans-serif', border: `1px solid ${T.border}` }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={resolve} disabled={resolving}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: T.green, color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: resolving ? 0.6 : 1, fontFamily: 'Lato, sans-serif' }}>
                {resolving ? 'Resolving…' : '✓ Confirm Resolved'}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.textSub, cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALL USERS PANEL ──────────────────────────────────────────────────────────
function AllUsersPanel({ token, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setUsers(d.users); }).finally(() => setLoading(false));
  }, [token]);

  const toggle = async (id, active) => {
    const r = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !active }),
    });
    const d = await r.json();
    if (d.success) setUsers(p => p.map(u => u._id === id ? { ...u, isActive: !active } : u));
  };

  const filtered = users.filter(u =>
    (role === 'all' || u.role === role) &&
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <button onClick={onBack} style={BB}>← Back to Dashboard</button>
      <h2 style={{ color: T.text, marginBottom: 20, fontWeight: 800, fontFamily: ' sans-serif', fontSize: 22 }}>All Users ({users.length})</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} style={IS} />
        <select value={role} onChange={e => setRole(e.target.value)} style={{ ...IS, flex: 'none', cursor: 'pointer' }}>
          <option value="all">All Roles</option>
          <option value="tourist">Traveler</option>
          <option value="host">Host</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: T.text, fontSize: 13, fontFamily: 'Lato, sans-serif' }}>
              <thead>
                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h =>
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: T.textSub, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.surfaceAlt }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ padding: '12px 16px', color: T.textSub }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.role === 'host' ? T.greenLight : T.accentLight, color: u.role === 'host' ? T.green : T.accent }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.textSub }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.isActive ? T.greenLight : T.redLight, color: u.isActive ? T.green : T.red }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggle(u._id, u.isActive)}
                        style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: u.isActive ? T.redLight : T.greenLight, color: u.isActive ? T.red : T.green, fontFamily: 'Lato, sans-serif' }}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p style={{ color: T.textMuted, textAlign: 'center', padding: 40 }}>No users found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALL DISPUTES PANEL ───────────────────────────────────────────────────────
function AllDisputesPanel({ token, onBack }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/admin/disputes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setDisputes(d.disputes); }).finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  const resolve = async id => {
    const r = await fetch(`${API_BASE}/admin/disputes/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'resolved', resolution: note }),
    });
    if ((await r.json()).success) { setSelected(null); setNote(''); load(); }
  };

  const sc = { open: T.red, 'in-progress': T.amber, resolved: T.green, rejected: T.textMuted, escalated: T.purple };
  const sbg = { open: T.redLight, 'in-progress': T.amberLight, resolved: T.greenLight, rejected: T.bg, escalated: T.purpleLight };

  return (
    <div>
      <button onClick={onBack} style={BB}>← Back to Dashboard</button>
      <h2 style={{ color: T.text, marginBottom: 20, fontWeight: 800, fontFamily: ' sans-serif', fontSize: 22 }}>All Disputes ({disputes.length})</h2>
      {loading ? <Spinner /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {disputes.map(d => (
              <div key={d._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: T.text, fontWeight: 700, marginBottom: 4, fontSize: 15 }}>{d.issue}</p>
                    <p style={{ color: T.textSub, fontSize: 13 }}>{d.travelerId?.fullName} vs {d.hostId?.fullName} · <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{d.bookingRefId}</span></p>
                    <p style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>{d.description?.slice(0, 120)}…</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sbg[d.status] || T.bg, color: sc[d.status] || T.textSub }}>{d.status}</span>
                    {d.status === 'open' && <button onClick={() => setSelected(d)} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: T.accent, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>Resolve</button>}
                  </div>
                </div>
              </div>
            ))}
            {disputes.length === 0 && <div style={{ background: T.greenLight, border: `1px solid #A7F3D0`, borderRadius: 12, padding: 40, textAlign: 'center' }}><p style={{ color: T.green, fontWeight: 700 }}>✓ No disputes</p></div>}
          </div>
          {selected && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
              <div style={{ background: T.surface, borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <h3 style={{ color: T.text, marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>Resolve Dispute</h3>
                <p style={{ color: T.textSub, fontSize: 13, marginBottom: 16 }}>{selected.issue} — {selected.travelerId?.fullName} vs {selected.hostId?.fullName}</p>
                <textarea rows={4} placeholder="Resolution notes…" value={note} onChange={e => setNote(e.target.value)} style={{ ...IS, width: '100%', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={() => resolve(selected._id)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: T.accent, color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>Mark Resolved</button>
                  <button onClick={() => setSelected(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.textSub, cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontWeight: 600 }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export function AdminDashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [rev, setRev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshed, setRefreshed] = useState(null);

  const [sosAlerts, setSosAlerts] = useState([]);
  const [loadingSOS, setLoadingSOS] = useState(false);
  const sosIntervalRef = useRef(null);

  const token = user?.token || localStorage.getItem('token');

  const fetchSOS = useCallback(async () => {
    setLoadingSOS(true);
    try {
      const r = await fetch(`${API_BASE}/admin/sos/active`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) setSosAlerts(d.alerts || []);
    } catch (e) { console.error('SOS fetch error:', e); }
    finally { setLoadingSOS(false); }
  }, [token]);

  useEffect(() => {
    fetchSOS();
    sosIntervalRef.current = setInterval(fetchSOS, 30000);
    return () => clearInterval(sosIntervalRef.current);
  }, [fetchSOS]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [uR, dR, rR] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, { headers: h }).then(r => r.json()),
        fetch(`${API_BASE}/admin/disputes`, { headers: h }).then(r => r.json()),
        fetch(`${API_BASE}/admin/revenue`, { headers: h }).then(r => r.json()),
      ]);
      if (uR.success) setUsers(uR.users);
      if (dR.success) setDisputes(dR.disputes);
      if (rR.success) setRev(rR.revenue);
      setRefreshed(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const travelers = users.filter(u => u.role === 'tourist').length;
  const hosts = users.filter(u => u.role === 'host').length;
  const openCount = disputes.filter(d => d.status === 'open').length;
  const newThisMonth = users.filter(u => {
    const d = new Date(u.createdAt), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const grandTotal = rev?.totals?.grandTotal ?? 0;
  const hostFee = rev?.totals?.hostEarningFee ?? 0;
  const tripFee = rev?.totals?.tripFee ?? 0;
  const growthPct = rev?.growth?.percentage ?? 0;

  const revenueChart = (rev?.monthly ?? []).slice(-6).map(m => ({
    month: m.shortLabel,
    'Host Earnings Fee': Math.round(m.hostEarningFee),
    'Trip Fee': Math.round(m.tripFee),
  }));

  const userChart = buildUserGrowth(users);

  function Navbar() {
    return (
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Syne, sans-serif' }}>ভ্রমণবন্ধু</div>
            <div style={{ fontSize: 10, color: T.accent, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: ' monospace' }}>Admin Dashboard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={fetchAll} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 6 }}>
              <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>

            <button onClick={() => setView('sos')}
              style={{ position: 'relative', background: sosAlerts.length > 0 ? T.redLight : 'none', border: sosAlerts.length > 0 ? `1px solid #FECACA` : 'none', borderRadius: 8, color: sosAlerts.length > 0 ? T.red : T.textMuted, cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', fontFamily: 'Lato, sans-serif' }}
              title="SOS Alerts">
              <Radio size={16} style={{ animation: sosAlerts.length > 0 ? 'pulse 1.5s infinite' : 'none' }} />
              {sosAlerts.length > 0 && (
                <>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{sosAlerts.length} SOS</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: '50%', background: T.red, border: `2px solid ${T.surface}`, animation: 'pulse 1s infinite' }} />
                </>
              )}
            </button>

            <div style={{ position: 'relative' }}>
              <Bell size={17} color={T.textMuted} />
              {openCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: T.red, color: '#fff', fontSize: 9, borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{openCount}</span>}
            </div>
            <img
              src={user?.avatar || user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'admin'}`}
              alt="admin" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.border}` }}
              onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`; }}
            />
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><LogOut size={17} /></button>
          </div>
        </div>
      </nav>
    );
  }

  if (view === 'allUsers') return <div style={PAGE}><style>{globalStyles}</style><Navbar /><div style={WRAP}><AllUsersPanel token={token} onBack={() => setView('dashboard')} /></div></div>;
  if (view === 'allDisputes') return <div style={PAGE}><style>{globalStyles}</style><Navbar /><div style={WRAP}><AllDisputesPanel token={token} onBack={() => setView('dashboard')} /></div></div>;
  if (view === 'sos') return (
    <div style={PAGE}><style>{globalStyles}</style><Navbar />
      <div style={WRAP}>
        <SOSMonitorPanel token={token} onBack={() => setView('dashboard')} sosAlerts={sosAlerts} loadingSOS={loadingSOS} refreshSOS={fetchSOS} />
      </div>
    </div>
  );

  return (
    <div style={PAGE}>
      <style>{globalStyles}</style>
      <Navbar />
      <div style={WRAP}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: ' sans-serif' }}>Platform Overview</h2>
            <p style={{ color: T.textMuted, fontSize: 13 }}>
              {refreshed ? `Live DB · updated ${refreshed.toLocaleTimeString()}` : 'Fetching live data…'}
            </p>
          </div>
          {loading && <Loader2 size={18} color={T.accent} style={{ animation: 'spin 1s linear infinite' }} />}
        </div>

        {/* ── SOS Alert Banner ── */}
        {sosAlerts.length > 0 && (
          <div onClick={() => setView('sos')}
            style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 14, background: T.redLight, border: `1px solid #FECACA`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = T.redLight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sosPulse 2s infinite' }}>
                <Radio size={18} color={T.red} />
              </div>
              <div>
                <p style={{ color: T.red, fontWeight: 700, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>
                  🚨 {sosAlerts.length} Active SOS Alert{sosAlerts.length !== 1 ? 's' : ''} — Immediate Attention Required
                </p>
                <p style={{ color: '#B91C1C', fontSize: 12, marginTop: 2 }}>
                  {sosAlerts.map(a => a.userName).join(' · ')} · Click to view live tracking
                </p>
              </div>
            </div>
            <span style={{ fontSize: 12, color: T.red, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: `1px solid #FECACA`, background: T.surface }}>
              Open Monitor →
            </span>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 14, marginBottom: 22 }}>
          <StatCard icon={Users} color={T.accent} bgColor={T.accentLight} loading={loading} value={users.length.toLocaleString()} label="Total Users" sub={`${travelers} travelers · ${hosts} hosts`} />
          <StatCard icon={Calendar} color={T.teal} bgColor={T.tealLight} loading={loading} value={newThisMonth} label="New This Month" sub="Registered this month" />
          <StatCard icon={DollarSign} color={T.purple} bgColor={T.purpleLight} loading={loading} value={taka(grandTotal)} label="Platform Revenue" badge="LIVE DB"
            sub={rev ? (growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`) + ' vs last month' : 'HostEarning.platformFee + Trip.platformFee'}
            subColor={growthPct >= 0 ? T.green : T.red} />
          <StatCard icon={AlertTriangle} color={T.amber} bgColor={T.amberLight} loading={loading} value={openCount} label="Open Disputes" sub={openCount > 0 ? 'Requires attention' : 'All resolved ✓'} subColor={openCount > 0 ? T.amber : T.green} />

          {/* SOS Stat Card */}
          <div onClick={() => setView('sos')}
            style={{ background: sosAlerts.length > 0 ? T.redLight : T.surface, border: `1px solid ${sosAlerts.length > 0 ? '#FECACA' : T.border}`, borderRadius: 16, padding: 22, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', animation: 'fadeIn 0.4s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(220,38,38,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={20} color={T.red} style={{ animation: sosAlerts.length > 0 ? 'pulse 1.5s infinite' : 'none' }} />
              </div>
              {sosAlerts.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#FCA5A522', color: T.red, fontFamily: 'DM Mono, monospace' }}>LIVE</span>}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: sosAlerts.length > 0 ? T.red : T.text, marginBottom: 4, fontFamily: 'DM Mono, monospace' }}>{sosAlerts.length}</div>
            <p style={{ color: T.textSub, fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Active SOS Alerts</p>
            <p style={{ fontSize: 11, color: sosAlerts.length > 0 ? T.red : T.green }}>{sosAlerts.length > 0 ? 'Needs immediate action' : 'All travelers safe ✓'}</p>
          </div>
        </div>

        {/* ── Revenue source row ── */}
        {!loading && rev && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 22 }}>
            {[
              { label: 'HostEarning Platform Fee', value: taka(hostFee), count: `${rev.totals.hostEarningCount} records`, color: T.purple, note: 'HostEarning.platformFee sum' },
              { label: 'Trip Platform Fee', value: taka(tripFee), count: `${rev.totals.tripCount} trips`, color: T.green, note: 'Trip.platformFee sum' },
              { label: 'Combined Total Revenue', value: taka(grandTotal), count: 'All time', color: T.accent, note: 'Both sources combined' },
              { label: 'This Month', value: taka(rev.growth.thisMonth), count: `Last month: ${taka(rev.growth.lastMonth)}`, color: T.amber, note: 'Current month platform fees' },
            ].map(({ label, value, count, color, note }) => (
              <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ width: 28, height: 4, borderRadius: 2, background: color, marginBottom: 12 }} />
                <p style={{ color: T.textMuted, fontSize: 11, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                <p style={{ color: T.text, fontSize: 20, fontWeight: 700, fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>{value}</p>
                <p style={{ color: T.green, fontSize: 11, marginBottom: 2, fontWeight: 600 }}>{count}</p>
                <p style={{ color: T.textMuted, fontSize: 10 }}>{note}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 22 }}>
          <Card title="Platform Revenue — Real Database" subtitle="HostEarning.platformFee + Trip.platformFee per month" badge="LIVE DB">
            {loading ? <Spinner /> : revenueChart.length === 0 ? (
              <p style={{ color: T.textMuted, textAlign: 'center', padding: 40, fontSize: 13 }}>No revenue data yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueChart} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="month" stroke={T.border} tick={{ fill: T.textSub, fontSize: 11 }} />
                    <YAxis stroke={T.border} tick={{ fill: T.textSub, fontSize: 10 }} tickFormatter={v => '৳' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)} />
                    <Tooltip content={<RevTooltip />} />
                    <Legend wrapperStyle={{ color: T.textSub, fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Host Earnings Fee" fill={T.purple} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Trip Fee" fill={T.teal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ color: T.textMuted, fontSize: 10, textAlign: 'center', marginTop: 8 }}>Source: MongoDB → HostEarning.platformFee &amp; Trip.platformFee</p>
              </>
            )}
          </Card>

          <Card title="User Growth" subtitle="Cumulative travelers &amp; hosts — last 6 months">
            {loading ? <Spinner /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={userChart} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="month" stroke={T.border} tick={{ fill: T.textSub, fontSize: 11 }} />
                  <YAxis stroke={T.border} tick={{ fill: T.textSub, fontSize: 10 }} />
                  <Tooltip content={<UserTooltip />} />
                  <Legend wrapperStyle={{ color: T.textSub, fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="travelers" name="Travelers" fill={T.accent} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hosts" name="Hosts" fill={T.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* ── Revenue Breakdown Card ── */}
        {!loading && rev && grandTotal > 0 && (
          <Card title="Revenue Breakdown" subtitle="Platform fee split between host bookings and trips">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
              <div>
                {[
                  { label: 'HostEarning.platformFee', value: taka(hostFee), pct: grandTotal > 0 ? (hostFee / grandTotal) * 100 : 0, color: T.purple },
                  { label: 'Trip.platformFee', value: taka(tripFee), pct: grandTotal > 0 ? (tripFee / grandTotal) * 100 : 0, color: T.teal },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: T.textSub, fontSize: 13, fontWeight: 500 }}>{label}</span>
                      <span style={{ color: T.text, fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>{value}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: T.bg, border: `1px solid ${T.border}` }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.8s' }} />
                    </div>
                    <p style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>{pct.toFixed(1)}% of total platform revenue</p>
                  </div>
                ))}
              </div>
              <div style={{ background: T.accentLight, borderRadius: 12, padding: 20, border: `1px solid #BFDBFE` }}>
                <p style={{ color: T.accent, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>Grand Total Platform Revenue</p>
                <p style={{ color: T.text, fontSize: 30, fontWeight: 800, fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>{taka(grandTotal)}</p>
                <div style={{ borderTop: `1px solid #BFDBFE`, paddingTop: 14 }}>
                  {[
                    { l: 'From HostEarning.platformFee', v: taka(hostFee), c: T.purple },
                    { l: 'From Trip.platformFee', v: taka(tripFee), c: T.teal },
                    { l: 'This month', v: taka(rev.growth.thisMonth), c: T.accent },
                    { l: 'Last month', v: taka(rev.growth.lastMonth), c: T.textMuted },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: T.textSub, fontSize: 12 }}>{l}</span>
                      <span style={{ color: c, fontSize: 12, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── Bottom Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20, marginTop: 22 }}>
          <Card title="Recent Users">
            {loading ? <Spinner /> : (
              <>
                {users.slice(0, 5).map(u => (
                  <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, marginBottom: 8 }}>
                    <div>
                      <p style={{ color: T.text, fontSize: 13, marginBottom: 4, fontWeight: 600 }}>{u.fullName}</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: u.role === 'host' ? T.greenLight : T.accentLight, color: u.role === 'host' ? T.green : T.accent, fontWeight: 700 }}>{u.role}</span>
                        <span style={{ color: T.textMuted, fontSize: 10, alignSelf: 'center' }}>{timeAgo(u.createdAt)}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: u.isActive ? T.greenLight : T.redLight, color: u.isActive ? T.green : T.red, fontWeight: 700 }}>{u.isActive ? 'active' : 'inactive'}</span>
                  </div>
                ))}
                {users.length === 0 && <p style={{ color: T.textMuted, textAlign: 'center', padding: 20 }}>No users yet.</p>}
                <button onClick={() => setView('allUsers')} style={VAB}>View All Users →</button>
              </>
            )}
          </Card>

          <Card title="Recent Disputes">
            {loading ? <Spinner /> : (
              <>
                {disputes.slice(0, 4).map(d => (
                  <div key={d._id} style={{ padding: '10px 14px', borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.issue}</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: d.status === 'open' ? T.redLight : T.greenLight, color: d.status === 'open' ? T.red : T.green, fontWeight: 700 }}>{d.status}</span>
                    </div>
                    <p style={{ color: T.textSub, fontSize: 12 }}>{d.travelerId?.fullName} vs {d.hostId?.fullName}</p>
                  </div>
                ))}
                {disputes.length === 0 && <div style={{ textAlign: 'center', padding: 20 }}><p style={{ color: T.green, fontWeight: 700 }}>✓ No disputes</p></div>}
                <button onClick={() => setView('allDisputes')} style={VAB}>View All Disputes →</button>
              </>
            )}
          </Card>

          {/* SOS preview card */}
          <Card title="SOS Emergency Feed" subtitle="Live traveler distress signals">
            {loadingSOS ? <Spinner /> : sosAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                <Shield size={32} color={T.green} style={{ marginBottom: 10 }} />
                <p style={{ color: T.green, fontSize: 13, fontWeight: 700 }}>All travelers safe</p>
                <p style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>No active SOS signals</p>
              </div>
            ) : (
              <>
                {sosAlerts.slice(0, 3).map(a => (
                  <div key={a._id} style={{ padding: '10px 14px', borderRadius: 10, background: T.redLight, border: `1px solid #FECACA`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <p style={{ color: T.red, fontSize: 13, fontWeight: 700 }}>🚨 {a.userName}</p>
                      <span style={{ fontSize: 10, color: T.textMuted }}>{timeAgo(a.createdAt)}</span>
                    </div>
                    <p style={{ color: T.textSub, fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{a.location?.lat?.toFixed(4)}, {a.location?.lng?.toFixed(4)}</p>
                    {a.tripInfo?.destination && <p style={{ color: T.accent, fontSize: 11, marginTop: 2 }}>→ {a.tripInfo.destination}</p>}
                  </div>
                ))}
              </>
            )}
            <button onClick={() => setView('sos')} style={{ ...VAB, color: sosAlerts.length > 0 ? T.red : T.textSub, borderColor: sosAlerts.length > 0 ? '#FECACA' : T.border, background: sosAlerts.length > 0 ? T.redLight : T.bg }}>
              {sosAlerts.length > 0 ? `⚡ Open SOS Monitor (${sosAlerts.length} active)` : 'Open SOS Monitor →'}
            </button>
          </Card>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 20, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 10 }}>
            {[
              { icon: Users, color: T.accent, bg: T.accentLight, label: 'Manage Users', sub: 'View & moderate', action: () => setView('allUsers') },
              { icon: AlertTriangle, color: T.amber, bg: T.amberLight, label: 'Disputes', sub: 'Review cases', action: () => setView('allDisputes') },
              {
                icon: Radio, color: T.red, bg: T.redLight, label: 'SOS Monitor',
                sub: sosAlerts.length > 0 ? `${sosAlerts.length} active alert${sosAlerts.length !== 1 ? 's' : ''}` : 'All clear',
                action: () => setView('sos'), highlight: sosAlerts.length > 0
              },
            ].map(({ icon: Icon, color, bg, label, sub, action, highlight }) => (
              <button key={label} onClick={action}
                style={{ padding: 16, borderRadius: 12, border: `1px solid ${highlight ? '#FECACA' : T.border}`, background: highlight ? T.redLight : T.surfaceAlt, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Lato, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = highlight ? T.redLight : T.surfaceAlt; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={17} color={color} style={{ animation: highlight ? 'pulse 1.5s infinite' : 'none' }} />
                </div>
                <p style={{ color: T.text, fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{label}</p>
                <p style={{ color: highlight ? T.red : T.textMuted, fontSize: 11 }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}