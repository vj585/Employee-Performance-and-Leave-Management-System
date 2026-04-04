import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';

const STATUS_COLORS = { Approved: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };
const TYPE_COLORS = { Annual: '#3b82f6', Sick: '#ef4444', Personal: '#f59e0b' };
const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
          <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const LeaveReports = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchLeaves = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setLeaves(data);
      } catch (err) { toast.error('Failed to load leave reports'); }
      finally { setLoading(false); }
    };
    fetchLeaves();
  }, []);

  if (loading) return <div className="loading-screen">Generating Reports...</div>;

  const filteredLeaves = leaves.filter(l =>
    (statusFilter === 'All' || l.status === statusFilter) &&
    (typeFilter === 'All' || l.leaveType === typeFilter)
  );

  // Chart data
  const statusCounts = leaves.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const pieData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k], fill: STATUS_COLORS[k] || '#64748b' }));

  const typeCounts = leaves.reduce((acc, l) => { const t = normalizeType(l.leaveType); acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const barData = Object.keys(typeCounts).map(k => ({ name: k, count: typeCounts[k], fill: TYPE_COLORS[k] || '#64748b' }));

  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1.4rem' }}>Leave Reports</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{leaves.length} total leave requests across all employees</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          onClick={() => toast('Export coming soon!')}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { icon: <CheckCircle size={22} color="#10b981" />, label: 'Approved Leaves', value: approvedCount, bg: 'rgba(16,185,129,0.1)' },
          { icon: <Clock size={22} color="#f59e0b" />, label: 'Pending Review', value: pendingCount, bg: 'rgba(245,158,11,0.1)' },
          { icon: <XCircle size={22} color="#ef4444" />, label: 'Rejected', value: rejectedCount, bg: 'rgba(239,68,68,0.1)' },
        ].map((k, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: k.bg }}>
            {k.icon}
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{k.label}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.3rem' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>

        {/* Pie: Status breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}>Status Breakdown</h3>
          <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>How many requests are Approved, Pending, or Rejected</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={4}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />)}
                </Pie>
                <RechartsTooltip formatter={(v, n) => [`${v} request${v !== 1 ? 's' : ''}`, n]}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10 }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#94a3b8' }} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Type frequency */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}>Leave Category Frequency</h3>
          <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total requests filed per leave type (Annual, Sick, Personal)</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={barData} barSize={56} margin={{ top: 18, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  {barData.map((entry, i) => (
                    <linearGradient key={i} id={`leave_bar_${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-4}
                  label={{ value: 'No. of Requests', angle: -90, position: 'insideLeft', offset: 14, style: { fill: '#64748b', fontSize: 11 } }} />
                <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10 }} labelStyle={{ color: '#f8fafc', fontWeight: 600 }} itemStyle={{ color: '#94a3b8' }} formatter={(v, n) => [`${v} request${v !== 1 ? 's' : ''}`, `${n} Leave`]} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={`url(#leave_bar_${i})`} />)}
                  <LabelList dataKey="count" position="top" style={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtered Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            <FileText size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Leave Records ({filteredLeaves.length})
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <option value="All">All Types</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
        </div>
        {filteredLeaves.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No leaves match the current filters.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                {['Employee', 'Leave Type', 'Start Date', 'End Date', 'Duration', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => {
                const days = Math.ceil(Math.abs(new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                const statusColor = STATUS_COLORS[leave.status] || '#94a3b8';
                return (
                  <tr key={leave._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{leave.employee?.name || 'Unknown'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: `${TYPE_COLORS[normalizeType(leave.leaveType)] || '#64748b'}18`, color: TYPE_COLORS[normalizeType(leave.leaveType)] || '#94a3b8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {normalizeType(leave.leaveType)}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{days} day{days !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: `${statusColor}18`, color: statusColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                        {leave.status}
                      </span>
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

export default LeaveReports;
