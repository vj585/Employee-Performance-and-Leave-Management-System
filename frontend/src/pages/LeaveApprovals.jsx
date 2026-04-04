import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, Filter, Calendar, CheckCircle, Clock, FileText, ExternalLink, Loader2 } from 'lucide-react';

const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const LeaveApprovals = () => {
  const { user } = useOutletContext();
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaves = async () => {
    const token = localStorage.getItem('employeeToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAllLeaves(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (leaveId, status) => {
    setProcessingId(leaveId);
    const token = localStorage.getItem('employeeToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Leave ${status} successfully.`);
        fetchLeaves(); // Refresh the list
      } else {
        const err = await res.json();
        toast.error('Error: ' + err.message);
      }
    } catch (error) {
      toast.error('Network error handling approval.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading-screen">Loading records...</div>;

  const pendingCount = allLeaves.filter(l => l.status === 'Pending').length;
  const approvedCount = allLeaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = allLeaves.filter(l => l.status === 'Rejected').length;
  
  let filteredLeaves = allLeaves.filter(l => l.status === activeTab);

  if (leaveTypeFilter !== 'All') {
    filteredLeaves = filteredLeaves.filter(l => l.leaveType === leaveTypeFilter);
  }

  if (dateFilter !== 'All') {
    const now = new Date();
    filteredLeaves = filteredLeaves.filter(l => {
      const leaveDate = new Date(l.startDate);
      if (dateFilter === 'ThisMonth') {
        return leaveDate.getMonth() === now.getMonth() && leaveDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'LastMonth') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return leaveDate.getMonth() === lastMonth.getMonth() && leaveDate.getFullYear() === lastMonth.getFullYear();
      }
      if (dateFilter === 'ThisYear') {
        return leaveDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  const getTypeStyle = (type) => {
    if(type === 'Annual') return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
    if(type === 'Sick') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
    return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
  };

  const viewDocument = (base64) => {
    if(!base64) return;
    try {
      const base64Parts = base64.split(',');
      const byteString = atob(base64Parts[1]);
      const mimeString = base64Parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], {type: mimeString});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      toast.error("Failed to open document format.");
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Leave Approvals</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
            You have <strong style={{ color: 'var(--primary)' }}>{pendingCount} pending</strong> request{pendingCount !== 1 ? 's' : ''} to review today.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveTab('Pending')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'Pending' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: activeTab === 'Pending' ? 'var(--primary)' : 'var(--text-secondary)', padding: '0.6rem 1rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Pending ({pendingCount})
          </button>
          <button 
            onClick={() => setActiveTab('Approved')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', color: activeTab === 'Approved' ? '#10b981' : 'var(--text-secondary)', padding: '0.6rem 1rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Approved ({approvedCount})
          </button>
          <button 
            onClick={() => setActiveTab('Rejected')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', border: 'none', color: activeTab === 'Rejected' ? '#ef4444' : 'var(--text-secondary)', padding: '0.6rem 1rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <select 
              value={leaveTypeFilter} 
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.6rem 2rem 0.6rem 2.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', appearance: 'none', fontWeight: 500 }}
            >
              <option value="All">All Leave Types</option>
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Personal">Personal Leave</option>
            </select>
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.6rem 2rem 0.6rem 2.2rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', appearance: 'none', fontWeight: 500 }}
            >
              <option value="All">All Time</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
              <option value="ThisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-panel animate-fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem', minHeight: '400px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--surface-border)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>EMPLOYEE NAME</th>
              <th style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>TYPE</th>
              <th style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>DURATION</th>
              <th style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>DOC</th>
              <th style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>REASON</th>
              <th style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>STATUS</th>
              {activeTab === 'Pending' && <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No {activeTab.toLowerCase()} requests found.
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                const typeStyle = getTypeStyle(leave.leaveType);
                
                return (
                  <tr key={leave._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        {leave.employee?.profileImage ? <img src={leave.employee.profileImage} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : leave.employee?.name?.substring(0,2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>{leave.employee?.name || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                           {leave.employee?.designation || leave.employee?.department || 'Employee'}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ background: typeStyle.bg, color: typeStyle.color, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {normalizeType(leave.leaveType)} Leave
                      </span>
                    </td>
                    
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                        {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-glow)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                        {days} Day{days > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem' }}>
                      {leave.supportDoc ? (
                        <button 
                          onClick={() => viewDocument(leave.supportDoc)}
                          style={{ background: 'var(--primary-glow)', border: 'none', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Supporting Document"
                        >
                          <FileText size={18} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    
                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: activeTab === 'Pending' ? '#f59e0b' : activeTab === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {activeTab === 'Pending' && <Clock size={16} />}
                        {activeTab === 'Approved' && <CheckCircle size={16} />}
                        {activeTab === 'Rejected' && <X size={16} />}
                        {activeTab === 'Pending' ? 'Pending Review' : activeTab}
                      </div>
                    </td>
                    
                    {activeTab === 'Pending' && (
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                            disabled={processingId === leave._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: processingId === leave._id ? 'not-allowed' : 'pointer', fontWeight: 600, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', opacity: processingId === leave._id ? 0.7 : 1 }}
                          >
                            {processingId === leave._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                            disabled={processingId === leave._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: processingId === leave._id ? 'not-allowed' : 'pointer', fontWeight: 600, boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)', opacity: processingId === leave._id ? 0.7 : 1 }}
                          >
                            {processingId === leave._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{approvedCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>APPROVED THIS YEAR</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>TOTAL PENDING</div>
          </div>
        </div>
      </div>
{/* Closing div */}
    </div>
  );
};

export default LeaveApprovals;
