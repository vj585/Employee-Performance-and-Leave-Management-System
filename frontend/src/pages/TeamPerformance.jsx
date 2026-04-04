import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeamPerformance = () => {
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamPerformance = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance/team-latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setTeamStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamPerformance();
  }, []);

  if (loading) return <div className="loading-screen">Loading team performance data...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Team Performance Overview</h2>
      
      {teamStats.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No employees found on the team.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Employee</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Latest Rating</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Last Evaluated</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.map((stat) => (
              <tr key={stat.employee._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                    {stat.employee.profileImage ? <img src={stat.employee.profileImage} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : stat.employee.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)' }}>{stat.employee.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {stat.employee.designation ? stat.employee.designation + ' - ' : ''}{stat.employee.department || 'General'}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 'bold', color: stat.latestRating === 'N/A' ? 'var(--text-muted)' : 'var(--primary)', fontSize: '1.1rem' }}>
                    {stat.latestRating} {stat.latestRating !== 'N/A' && '/ 5'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  {stat.latestDate ? new Date(stat.latestDate).toLocaleDateString('en-GB') : 'Never'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => navigate(`/manager/performance-evaluation?employeeId=${stat.employee._id}`)}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  >
                    Evaluate Again
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeamPerformance;
