import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Briefcase, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LabelList
} from 'recharts';

const ROLE_COLORS = { Employee: '#3b82f6', Manager: '#a855f7', Admin: '#10b981' };
const LEAVE_COLORS = { Annual: '#3b82f6', Sick: '#ef4444', Personal: '#f59e0b' };
const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
        <p style={{ margin: 0, color: '#f8fafc', fontWeight: 600 }}>{label} Leave</p>
        <p style={{ margin: '4px 0 0', color: '#38bdf8', fontWeight: 700 }}>{payload[0].value} request{payload[0].value !== 1 ? 's' : ''} total</p>
      </div>
    );
  }
  return null;
};

const renderCustomLegend = (props) => {
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

const AdminDashboard = () => {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, totalEvaluations: 0, roleData: [], leaveData: [] });

  useEffect(() => {
    const fetchAdminStats = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const [empRes, leavesRes, perfRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        let employees = [], leaves = [], evals = [];
        if (empRes.ok) employees = await empRes.json();
        if (leavesRes.ok) leaves = await leavesRes.json();
        if (perfRes.ok) evals = await perfRes.json();

        const roleCount = employees.reduce((acc, e) => { acc[e.role] = (acc[e.role] || 0) + 1; return acc; }, {});
        const roleData = Object.keys(roleCount).map(k => ({ name: k, value: roleCount[k], fill: ROLE_COLORS[k] || '#64748b' }));

        const leaveCount = leaves.reduce((acc, l) => { const t = normalizeType(l.leaveType); acc[t] = (acc[t] || 0) + 1; return acc; }, {});
        const leaveData = Object.entries(leaveCount).map(([k, v]) => ({ name: k, count: v, fill: LEAVE_COLORS[k] || '#64748b' }));

        setStats({ employees: employees.length, pendingLeaves: leaves.filter(l => l.status === 'Pending').length, totalEvaluations: evals.length, roleData, leaveData });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <div className="loading-screen">Aggregating Corporate Data...</div>;

  return (
    <>
      <div className="welcome-banner glass-panel animate-fade-in delay-1" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))', borderColor: 'var(--surface-border)' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.9rem' }}>Administration Terminal</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>Master system overview — {user.name.split(' ')[0]}.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-panel animate-fade-in delay-2">
          <div className="kpi-icon-wrapper bg-blue"><Users size={24} color="#2563eb" /></div>
          <div className="kpi-info"><span className="kpi-label">Total Users</span><span className="kpi-value">{stats.employees}</span></div>
        </div>
        <div className="kpi-card glass-panel animate-fade-in delay-3">
          <div className="kpi-icon-wrapper bg-orange"><AlertTriangle size={24} color="#f59e0b" /></div>
          <div className="kpi-info"><span className="kpi-label">Pending Leaves</span><span className="kpi-value">{stats.pendingLeaves}</span></div>
        </div>
        <div className="kpi-card glass-panel animate-fade-in delay-4">
          <div className="kpi-icon-wrapper bg-green" style={{ background: 'rgba(16,185,129,0.1)' }}><FileText size={24} color="#10b981" /></div>
          <div className="kpi-info"><span className="kpi-label">Total Evaluations</span><span className="kpi-value">{stats.totalEvaluations}</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.5rem' }}>

        {/* Pie: Role Distribution */}
        <div className="glass-panel animate-fade-in delay-4" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <Briefcase size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>User Role Distribution</h3>
          </div>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Breakdown of all registered users by access role</p>
          {stats.roleData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No users found</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.roleData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={4}>
                    {stats.roleData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value} user${value !== 1 ? 's' : ''}`, name]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10 }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#94a3b8' }} />
                  <Legend content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {stats.roleData.map(d => (
              <div key={d.name} style={{ background: `${d.fill}18`, border: `1px solid ${d.fill}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', color: d.fill, fontWeight: 600 }}>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Bar: Leave Type Frequency */}
        <div className="glass-panel animate-fade-in delay-5" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <BarChart2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Leave Type Frequency</h3>
          </div>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total number of requests submitted per leave category across all users</p>
          {stats.leaveData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No leave data yet</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={stats.leaveData} barSize={52} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {stats.leaveData.map((entry, i) => (
                      <linearGradient key={i} id={`admin_bar_${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13 }} tickLine={false} axisLine={false} dy={8} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-4}
                    label={{ value: 'No. of Requests', angle: -90, position: 'insideLeft', offset: 14, style: { fill: '#64748b', fontSize: 11 } }}
                  />
                  <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {stats.leaveData.map((entry, index) => (
                      <Cell key={index} fill={`url(#admin_bar_${index})`} />
                    ))}
                    <LabelList dataKey="count" position="top" style={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {stats.leaveData.map(d => (
              <div key={d.name} style={{ background: `${d.fill}18`, border: `1px solid ${d.fill}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', color: d.fill, fontWeight: 600 }}>
                {d.name}: {d.count} request{d.count !== 1 ? 's' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
