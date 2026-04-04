import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Activity, Edit, FileText, HelpCircle, Sparkles, AlertTriangle, Info, Plane, Thermometer, Coffee } from 'lucide-react';

const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const Dashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [latestReview, setLatestReview] = useState(null);
  const [leaveSuggestion, setLeaveSuggestion] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const [leavesRes, perfRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves/my-leaves`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance/my-reviews`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        let leaves = await leavesRes.json();
        let reviews = await perfRes.json();
        
        if (!leavesRes.ok) leaves = [];
        if (!perfRes.ok) reviews = [];

        // --- Suggestion Logic ---
        const totalMax = 37;
        const remaining = (user?.leaveBalance?.Annual ?? 20) + (user?.leaveBalance?.Sick ?? 10) + (user?.leaveBalance?.Personal ?? 7);
        let msg = "Your leave usage is balanced.";
        let type = "blue";

        if (remaining <= (totalMax * 0.2)) {
          msg = "You are running low on leave balance. Plan your leave carefully.";
          type = "orange";
        } else {
          const approvedLeaves = Array.isArray(leaves) ? leaves.filter(l => l.status === 'Approved') : [];
          let daysSinceLastLeave = 999;
          
          if (approvedLeaves.length > 0) {
            const sorted = approvedLeaves.sort((a,b) => new Date(b.endDate) - new Date(a.endDate));
            daysSinceLastLeave = (Date.now() - new Date(sorted[0].endDate)) / (1000 * 60 * 60 * 24);
          }
          
          if (daysSinceLastLeave > 60 && remaining > 5) {
            msg = "You have not taken leave recently. Taking breaks can improve productivity.";
            type = "green";
          } else if (remaining > (totalMax * 0.5)) {
            msg = "You have a high amount of unused leave. Consider taking time off.";
            type = "green";
          }
        }
        setLeaveSuggestion({ message: msg, type: type });
        // --- End Suggestion Logic ---

        if (reviews.length > 0) setLatestReview(reviews[0]);

        const mappedLeaves = leaves.map(l => ({
          id: l._id,
          date: new Date(l.createdAt),
          text: `Your ${normalizeType(l.leaveType)} Leave request is currently ${l.status}.`,
          type: l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'orange'
        }));

        const mappedReviews = reviews.map(r => ({
          id: r._id,
          date: new Date(r.date || r.createdAt),
          text: `A new performance evaluation with a ${r.rating}/5 rating has been published.`,
          type: 'blue'
        }));

        const combined = [...mappedLeaves, ...mappedReviews]
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);

        setActivities(combined);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (d) => {
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="dashboard-grid">
      {/* LEFT COLUMN */}
      <div className="dashboard-main-col">
        <div className="welcome-banner glass-panel animate-fade-in delay-1">
          <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
          <p>Here's your employee overview for today.</p>
        </div>

        {leaveSuggestion && (
          <div className="glass-panel animate-fade-in delay-2" style={{ 
            borderLeft: `4px solid ${leaveSuggestion.type === 'green' ? '#10b981' : leaveSuggestion.type === 'orange' ? '#f59e0b' : '#3b82f6'}`, 
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: 'var(--surface-base)' 
          }}>
             {leaveSuggestion.type === 'green' && <Sparkles color="#10b981" size={24} />}
             {leaveSuggestion.type === 'orange' && <AlertTriangle color="#f59e0b" size={24} />}
             {leaveSuggestion.type === 'blue' && <Info color="#3b82f6" size={24} />}
             <div>
               <strong style={{display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem'}}>Leave Assistant</strong>
               <span style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>{leaveSuggestion.message}</span>
             </div>
          </div>
        )}

        <div className="kpi-grid">
          {/* Annual Leave */}
          <div className="kpi-card glass-panel animate-fade-in delay-2">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(37,99,235,0.12)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={26} color="#2563eb" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Annual Leave</span>
              <span className="kpi-value">{user.leaveBalance?.Annual ?? 20} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days left</span></span>
            </div>
          </div>

          {/* Sick Leave */}
          <div className="kpi-card glass-panel animate-fade-in delay-3">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(239,68,68,0.1)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={26} color="#ef4444" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Sick Leave</span>
              <span className="kpi-value">{user.leaveBalance?.Sick ?? 10} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days left</span></span>
            </div>
          </div>

          {/* Personal Leave */}
          <div className="kpi-card glass-panel animate-fade-in delay-4">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(245,158,11,0.1)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={26} color="#f59e0b" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Personal Leave</span>
              <span className="kpi-value">{user.leaveBalance?.Personal ?? user.leaveBalance?.Casual ?? 7} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days left</span></span>
            </div>
          </div>
        </div>

        <div className="recent-activity-section glass-panel animate-fade-in delay-4">
          <h3>Recent Activity</h3>
          
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recent activity to show yet.</p>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className={`activity-dot bg-${activity.type === 'red' ? 'orange' : activity.type}`}></div>
                  <div className="activity-text">
                    <p>{activity.text}</p>
                    <span className="activity-time">{formatDate(activity.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="dashboard-side-col animate-fade-in delay-5">
        
        {/* Performance Summary Card */}
        <div className="perf-summary-card">
          <div className="perf-header">
            <h3>Performance Summary</h3>
            <span>{latestReview ? new Date(latestReview.date).toLocaleDateString('en-GB') : 'Cycle: N/A'}</span>
          </div>
          <div className="perf-body">
            <div className="perf-gauge-container">
              <div className="perf-gauge">
                <span className="perf-score">{latestReview ? latestReview.rating.toFixed(1) : '0.0'}</span>
                <span className="perf-max">CURRENT RATING</span>
              </div>
            </div>
            
            <div className="perf-text">
              <h4>{latestReview ? 'Evaluation Complete' : 'Pending Evaluation'}</h4>
              <p>{latestReview ? (latestReview.remarks.length > 60 ? latestReview.remarks.substring(0, 60) + '...' : latestReview.remarks) : 'You have not been evaluated for this quarter yet.'}</p>
            </div>

            <div className="perf-competencies">
              <span className="comp-title">CORE COMPETENCIES</span>
              
              <div className="comp-row">
                <div className="comp-label">
                  <span>Technical Expertise</span>
                  <span>{latestReview?.technicalRating ? latestReview.technicalRating.toFixed(1) : '0.0'}</span>
                </div>
                <div className="comp-bar-bg">
                  <div className="comp-bar-fill" style={{ width: `${(latestReview?.technicalRating || 0) / 5 * 100}%` }}></div>
                </div>
              </div>

              <div className="comp-row">
                <div className="comp-label">
                  <span>Leadership</span>
                  <span>{latestReview?.leadershipRating ? latestReview.leadershipRating.toFixed(1) : '0.0'}</span>
                </div>
                <div className="comp-bar-bg">
                  <div className="comp-bar-fill" style={{ width: `${(latestReview?.leadershipRating || 0) / 5 * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="quick-actions-list">
          <button className="quick-action-item" onClick={() => navigate('/employee/profile')}>
            <div className="qa-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}><Edit size={20} /></div>
            <div className="qa-text">
              <strong>Update Profile</strong>
              <span>Manage your personal info</span>
            </div>
          </button>
          
          <button className="quick-action-item">
            <div className="qa-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}><FileText size={20} /></div>
            <div className="qa-text">
              <strong>Download Payslips</strong>
              <span>Get your latest payment records</span>
            </div>
          </button>

          <button className="quick-action-item">
            <div className="qa-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}><HelpCircle size={20} /></div>
            <div className="qa-text">
              <strong>HR Support</strong>
              <span>Submit a query or ticket</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
