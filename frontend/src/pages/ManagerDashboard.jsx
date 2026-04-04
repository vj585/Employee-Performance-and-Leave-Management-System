import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckSquare, Users, Activity, Star, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LabelList
} from 'recharts';

const STATUS_COLORS = { Pending: '#f59e0b', Approved: '#10b981', Rejected: '#ef4444' };

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const label2 = score === 0 ? 'Not Yet Evaluated' : `${score.toFixed(1)} / 5.0`;
    const color = score >= 4 ? '#10b981' : score >= 3 ? '#3b82f6' : score > 0 ? '#f59e0b' : '#94a3b8';
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
        <p style={{ margin: 0, color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>{label}</p>
        <p style={{ margin: '6px 0 0', color, fontWeight: 700, fontSize: '1rem' }}>Rating: {label2}</p>
        <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
          {score >= 4 ? '⭐ Excellent performer' : score >= 3 ? '👍 Good performer' : score > 0 ? '📈 Needs improvement' : '⏳ Awaiting evaluation'}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
        <p style={{ margin: 0, color: payload[0].payload.fill, fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ margin: '4px 0 0', color: '#f8fafc' }}>{payload[0].value} leave request{payload[0].value !== 1 ? 's' : ''}</p>
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

const ManagerDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0, pieData: [], barData: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const [leavesRes, perfRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance/team-latest`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        let leaves = [], performance = [];
        if (leavesRes.ok) leaves = await leavesRes.json();
        if (perfRes.ok) performance = await perfRes.json();

        const statusCounts = leaves.reduce((acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});
        const pieData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key], fill: STATUS_COLORS[key] || '#3b82f6' }));
        const barData = performance.map(stat => ({
          name: stat.employee.name.split(' ')[0],
          score: stat.latestRating === 'N/A' ? 0 : parseFloat(stat.latestRating)
        })).sort((a, b) => b.score - a.score);

        setStats({
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
          approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
          rejectedLeaves: leaves.filter(l => l.status === 'Rejected').length,
          pieData, barData
        });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-screen">Loading Team Analytics...</div>;

  return (
    <>
      <div className="welcome-banner glass-panel animate-fade-in delay-1" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(168,85,247,0.08))', borderColor: 'var(--surface-border)' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.9rem' }}>Team Overview, {user.name.split(' ')[0]}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0' }}>Here are your team's live analytics and leave insights.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-panel animate-fade-in delay-2">
          <div className="kpi-icon-wrapper bg-orange"><AlertCircle size={26} color="#f59e0b" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Approvals</span>
            <span className="kpi-value">{stats.pendingLeaves}</span>
          </div>
        </div>
        <div className="kpi-card glass-panel animate-fade-in delay-3" style={{ background: 'rgba(16,185,129,0.05)' }}>
          <div className="kpi-icon-wrapper bg-green"><CheckSquare size={26} color="#10b981" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Approved Leaves</span>
            <span className="kpi-value">{stats.approvedLeaves}</span>
          </div>
        </div>
        <div className="kpi-card glass-panel animate-fade-in delay-4" onClick={() => navigate('/manager/leave-approvals')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrapper bg-blue"><Users size={26} color="#2563eb" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Team Members</span>
            <span className="kpi-value">{stats.barData.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.5rem' }}>

        {/* Pie: Leave Status Breakdown */}
        <div className="glass-panel animate-fade-in delay-4" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <Activity size={20} color="#a855f7" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Leave Status Breakdown</h3>
          </div>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Distribution of all team leave requests by status</p>
          {stats.pieData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No leave data yet</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={4}>
                    {stats.pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Summary chips */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {stats.pieData.map(d => (
              <div key={d.name} style={{ background: `${d.fill}18`, border: `1px solid ${d.fill}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', color: d.fill, fontWeight: 600 }}>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Bar: Team Performance Ratings */}
        <div className="glass-panel animate-fade-in delay-5" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <Star size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Team Performance Ratings</h3>
          </div>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Latest evaluation scores per team member (out of 5.0) — sorted highest first</p>
          {stats.barData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No evaluations recorded yet</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={stats.barData} barSize={36} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="mgr_bar_gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} dy={8} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-4}
                    tickFormatter={v => v === 0 ? '0' : `${v}`}
                    label={{ value: 'Rating / 5', angle: -90, position: 'insideLeft', offset: 12, style: { fill: '#64748b', fontSize: 11 } }}
                  />
                  <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="url(#mgr_bar_gradient)">
                    <LabelList dataKey="score" position="top" style={{ fill: '#94a3b8', fontSize: 11 }} formatter={v => v > 0 ? v.toFixed(1) : '—'} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Reference scale */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {[['4–5', '#10b981', 'Excellent'], ['3–4', '#3b82f6', 'Good'], ['1–3', '#f59e0b', 'Needs Work'], ['0', '#94a3b8', 'No Data']].map(([range, color, label]) => (
              <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ color }}>{range}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
