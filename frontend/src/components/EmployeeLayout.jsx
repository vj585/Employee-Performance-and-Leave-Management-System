import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, 
  Search, Bell, ChevronDown, LogOut, CheckCircle, PlusCircle, Star, UserCircle
} from 'lucide-react';
import '../pages/Dashboard.css';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../context/AuthContext';

const EmployeeLayout = () => {
  const { user, token, logout, updateUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          updateUser(data);
        }
      })
      .catch(err => console.error("Profile sync error", err));
    }
  }, [token]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('employeeToken');
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('employeeToken');
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon-sm">
            <CheckCircle size={24} color="#ffffff" />
          </div>
          <h2>HR MS</h2>
        </div>
        
        <nav className="sidebar-nav">
          <a onClick={() => navigate('/employee/dashboard')} className={`nav-item ${location.pathname.includes('/dashboard') ? 'active' : ''}`} style={{cursor: 'pointer'}}>
            <Activity size={20} /><span>Dashboard</span>
          </a>
          <a onClick={() => navigate('/employee/apply-leave')} className={`nav-item ${location.pathname.includes('/apply-leave') ? 'active' : ''}`} style={{cursor: 'pointer'}}>
            <PlusCircle size={20} /><span>Apply Leave</span>
          </a>
          <a onClick={() => navigate('/employee/my-leaves')} className={`nav-item ${location.pathname.includes('/my-leaves') ? 'active' : ''}`} style={{cursor: 'pointer'}}>
            <Calendar size={20} /><span>My Leaves</span>
          </a>
          <a onClick={() => navigate('/employee/performance')} className={`nav-item ${location.pathname.includes('/performance') ? 'active' : ''}`} style={{cursor: 'pointer'}}>
            <Star size={20} /><span>Performance</span>
          </a>
          <a onClick={() => navigate('/employee/profile')} className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`} style={{cursor: 'pointer'}}>
            <UserCircle size={20} /><span>Profile</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <GlobalSearch role="Employee" />
          
          <div className="topbar-actions">
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && <span className="badge">{notifications.filter(n => !n.isRead).length}</span>}
              </button>
              
              {showNotifications && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '320px', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '12px' }}>{notifications.filter(n => !n.isRead).length} New</span>
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You're completely caught up!</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                          style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', cursor: n.isRead ? 'default' : 'pointer', background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.05)', transition: 'background 0.2s', display: 'flex', gap: '12px', opacity: n.isRead ? 0.7 : 1 }}
                        >
                          {!n.isRead ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div> : <div style={{ width: '8px', flexShrink: 0 }}></div>}
                          <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.message}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-profile" style={{ position: 'relative' }} ref={profileRef}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar">{user?.name ? user.name.charAt(0) : 'U'}</div>
                )}
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Employee'}</span>
                  <span className="user-role">{user?.designation || user?.role || 'Employee'}</span>
                </div>
                <ChevronDown size={16} className="text-secondary" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              
              {showProfileMenu && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '220px', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button onClick={() => { setShowProfileMenu(false); navigate('/employee/profile'); }} style={{ width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '8px' }}>My Profile</button>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '8px' }}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="dashboard-content">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
