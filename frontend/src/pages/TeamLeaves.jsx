import React, { useEffect, useState } from 'react';

const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setLeaves(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span style={{color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600}}>Approved</span>;
      case 'Rejected': return <span style={{color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600}}>Rejected</span>;
      default: return <span style={{color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600}}>Pending</span>;
    }
  };

  if (loading) return <div>Loading team leave history...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>All Team Leave History</h2>
      
      {leaves.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No leave requests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Employee</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Duration</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{leave.employee?.name || 'Unknown'}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{normalizeType(leave.leaveType)} Leave</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  {new Date(leave.startDate).toLocaleDateString('en-GB')} - {new Date(leave.endDate).toLocaleDateString('en-GB')}
                </td>
                <td style={{ padding: '1rem' }}>{getStatusBadge(leave.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeamLeaves;
