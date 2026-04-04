import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, PlusCircle } from 'lucide-react';

// Normalize legacy 'Casual' → 'Personal' for display
const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const TYPE_STYLES = {
  Annual:  { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
  Sick:    { bg: 'rgba(239, 68, 68, 0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  Personal: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
};

const STATUS_CONFIG = {
  Approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: <CheckCircle size={13} /> },
  Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: <XCircle size={13} /> },
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: <Clock size={13} /> },
};

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const MyLeaves = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchLeaves = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves/my-leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setLeaves(data);
      } catch (error) {
        console.error('Failed to fetch leaves', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  if (loading) return <div className="loading-screen">Loading your leave history...</div>;

  const counts = {
    All: leaves.length,
    Pending: leaves.filter(l => l.status === 'Pending').length,
    Approved: leaves.filter(l => l.status === 'Approved').length,
    Rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  let filtered = activeTab === 'All' ? leaves : leaves.filter(l => l.status === activeTab);
  if (typeFilter !== 'All') filtered = filtered.filter(l => l.leaveType === typeFilter);

  const totalDaysUsed = leaves
    .filter(l => l.status === 'Approved')
    .reduce((acc, l) => acc + Math.ceil(Math.abs(new Date(l.endDate) - new Date(l.startDate)) / (1000*60*60*24)) + 1, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 700 }}>My Leave History</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track all your leave requests and their approval status</p>
        </div>
        <button
          onClick={() => navigate('/employee/apply-leave')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.65rem 1.3rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <PlusCircle size={16} /> Apply Leave
        </button>
      </div>

      {/* KPI Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Requests', value: leaves.length, color: '#3b82f6', icon: <Calendar size={20} color="#3b82f6" />, bg: 'rgba(59,130,246,0.08)' },
          { label: 'Approved', value: counts.Approved, color: '#10b981', icon: <CheckCircle size={20} color="#10b981" />, bg: 'rgba(16,185,129,0.08)' },
          { label: 'Pending Review', value: counts.Pending, color: '#f59e0b', icon: <AlertCircle size={20} color="#f59e0b" />, bg: 'rgba(245,158,11,0.08)' },
          { label: 'Days Used (Approved)', value: totalDaysUsed, color: '#a855f7', icon: <Clock size={20} color="#a855f7" />, bg: 'rgba(168,85,247,0.08)' },
        ].map((k, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.1rem 1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', background: k.bg }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: `${k.color}15` }}>{k.icon}</div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500 }}>{k.label}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Balance Strip */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Leave Balance</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Annual Leave', balance: user.leaveBalance?.Annual ?? 20, max: 20, color: '#38bdf8' },
            { label: 'Sick Leave', balance: user.leaveBalance?.Sick ?? 10, max: 10, color: '#f87171' },
            { label: 'Personal Leave', balance: user.leaveBalance?.Personal ?? user.leaveBalance?.Casual ?? 7, max: 7, color: '#fbbf24' },
          ].map((b, i) => (
            <div key={i} style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{b.label}</span>
                <span style={{ fontSize: '0.85rem', color: b.color, fontWeight: 700 }}>{b.balance} / {b.max} days</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(148,163,184,0.2)', borderRadius: '100px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                <div style={{ height: '100%', width: `${Math.min((b.balance / b.max) * 100, 100)}%`, background: `linear-gradient(90deg, ${b.color}bb, ${b.color})`, borderRadius: '100px', transition: 'width 0.6s ease', boxShadow: `0 0 6px ${b.color}50` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            const cfg = STATUS_CONFIG[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                background: isActive ? (cfg ? cfg.bg : 'var(--primary)') : 'transparent',
                color: isActive ? (cfg ? cfg.color : '#fff') : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}>
                {tab} <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>({counts[tab]})</span>
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
            background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)',
            padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', appearance: 'none'
          }}>
            <option value="All">All Types</option>
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={40} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No leave requests found</p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>Try applying for a leave or adjusting your filters.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.03)' }}>
                {['Leave Type', 'Period', 'Duration', 'Reason', 'Applied On', 'Status'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.2rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave, i) => {
                const days = Math.ceil(Math.abs(new Date(leave.endDate) - new Date(leave.startDate)) / (1000*60*60*24)) + 1;
                const typeStyle = TYPE_STYLES[normalizeType(leave.leaveType)] || TYPE_STYLES.Annual;
                const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;
                return (
                  <tr key={leave._id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Type */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                        {normalizeType(leave.leaveType)}
                      </span>
                    </td>
                    {/* Period */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500 }}>
                        {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        to {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    {/* Duration */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>{days}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> day{days !== 1 ? 's' : ''}</span>
                    </td>
                    {/* Reason */}
                    <td style={{ padding: '1rem 1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', maxWidth: '220px' }}>
                      {leave.reason?.length > 55 ? leave.reason.substring(0, 55) + '...' : leave.reason || '—'}
                    </td>
                    {/* Applied On */}
                    <td style={{ padding: '1rem 1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(leave.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                        {statusCfg.icon}{leave.status}
                      </span>
                      {leave.managerNotes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{leave.managerNotes}"
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyLeaves;
