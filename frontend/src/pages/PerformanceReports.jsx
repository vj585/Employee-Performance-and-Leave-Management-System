import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Star, TrendingUp, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
  CartesianGrid, LabelList, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';

const RATING_COLOR = (v) => v >= 4 ? '#10b981' : v >= 3 ? '#3b82f6' : v > 0 ? '#f59e0b' : '#94a3b8';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '10px' }}>
        <p style={{ margin: 0, color: '#f8fafc', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: RATING_COLOR(val), fontWeight: 700 }}>Overall: {val.toFixed(1)} / 5.0</p>
      </div>
    );
  }
  return null;
};

const PerformanceReports = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setReviews(data);
      } catch (err) {
        toast.error('Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="loading-screen">Compiling Analytics...</div>;

  // Chart data: average rating per employee
  const empMap = {};
  reviews.forEach(r => {
    const name = r.userId?.name?.split(' ')[0] || 'Unknown';
    if (!empMap[name]) empMap[name] = { name, ratings: [], technical: [], leadership: [] };
    empMap[name].ratings.push(r.rating);
    if (r.technicalRating) empMap[name].technical.push(r.technicalRating);
    if (r.leadershipRating) empMap[name].leadership.push(r.leadershipRating);
  });
  const barData = Object.values(empMap).map(e => ({
    name: e.name,
    overall: parseFloat((e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length).toFixed(2)),
    technical: e.technical.length ? parseFloat((e.technical.reduce((a, b) => a + b, 0) / e.technical.length).toFixed(2)) : 0,
    leadership: e.leadership.length ? parseFloat((e.leadership.reduce((a, b) => a + b, 0) / e.leadership.length).toFixed(2)) : 0,
  })).sort((a, b) => b.overall - a.overall);

  const avgOverall = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(2) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1.4rem' }}>Performance Analytics</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{reviews.length} evaluations across {barData.length} employees</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          onClick={() => toast('Export coming soon!')}>
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* KPI chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { icon: <Star size={22} color="#f59e0b" />, label: 'Company Avg Rating', value: `${avgOverall} / 5.0`, bg: 'rgba(245,158,11,0.1)' },
          { icon: <Users size={22} color="#3b82f6" />, label: 'Employees Evaluated', value: barData.length, bg: 'rgba(59,130,246,0.1)' },
          { icon: <TrendingUp size={22} color="#10b981" />, label: 'Total Evaluations', value: reviews.length, bg: 'rgba(16,185,129,0.1)' },
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

      {reviews.length > 0 && (
        <>
          {/* Bar chart: Average ratings by employee */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}>Average Ratings by Employee</h3>
            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Bars show each employee's average Overall, Technical & Leadership scores (1–5 scale)</p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={barData} barGap={4} barCategoryGap="25%" margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="perf_overall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="perf_tech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#a855f7" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="perf_lead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-4}
                    label={{ value: 'Score / 5', angle: -90, position: 'insideLeft', offset: 12, style: { fill: '#64748b', fontSize: 11 } }} />
                  <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10 }} labelStyle={{ color: '#f8fafc', fontWeight: 600 }} itemStyle={{ color: '#94a3b8' }} />
                  <Legend wrapperStyle={{ paddingTop: '12px', color: '#94a3b8', fontSize: '0.82rem' }} />
                  <Bar dataKey="overall" name="Overall" fill="url(#perf_overall)" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="overall" position="top" style={{ fill: '#94a3b8', fontSize: 10 }} formatter={v => v.toFixed(1)} />
                  </Bar>
                  <Bar dataKey="technical" name="Technical" fill="url(#perf_tech)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leadership" name="Leadership" fill="url(#perf_lead)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evaluations Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>All Evaluation Records</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                  {['Employee', 'Reviewer', 'Date', 'Overall', 'Technical', 'Leadership', 'Remarks'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => {
                  const color = RATING_COLOR(rev.rating);
                  return (
                    <tr key={rev._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rev.userId?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rev.userId?.department || ''}</div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{rev.reviewerId?.name || '—'}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(rev.date).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>{rev.rating.toFixed(1)}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}> / 5</span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{rev.technicalRating?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{rev.leadershipRating?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '200px' }}>
                        {rev.remarks?.length > 50 ? rev.remarks.substring(0, 50) + '...' : rev.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {reviews.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No performance evaluations have been recorded yet.
        </div>
      )}
    </div>
  );
};

export default PerformanceReports;
