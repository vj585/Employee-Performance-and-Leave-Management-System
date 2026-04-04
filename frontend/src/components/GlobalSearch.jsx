import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Calendar, Star, ChevronRight } from 'lucide-react';

/**
 * GlobalSearch — role-aware search dropdown
 * Props:
 *  role: 'Employee' | 'Manager' | 'Admin'
 *  placeholder: string (optional)
 */
const normalizeType = (t) => (t === 'Casual' ? 'Personal' : t);

const GlobalSearch = ({ role = 'Employee', placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // debounce search
  const debounceRef = useRef(null);
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val.trim()), 300);
  };

  const runSearch = useCallback(async (q) => {
    const token = localStorage.getItem('employeeToken');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    const found = [];
    const qLow = q.toLowerCase();

    try {
      if (role === 'Employee') {
        // Search own leaves + performance reviews
        const [leavesRes, perfRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves/my-leaves`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance/my-reviews`, { headers }),
        ]);
        const leaves = leavesRes.ok ? await leavesRes.json() : [];
        const perf   = perfRes.ok  ? await perfRes.json()  : [];

        leaves.filter(l =>
          l.leaveType?.toLowerCase().includes(qLow) ||
          l.status?.toLowerCase().includes(qLow) ||
          l.reason?.toLowerCase().includes(qLow)
        ).slice(0, 4).forEach(l => found.push({
          id: l._id,
          icon: <Calendar size={14} />,
          label: `${normalizeType(l.leaveType)} Leave`,
          sub: `${l.status} · ${new Date(l.startDate).toLocaleDateString('en-GB')}`,
          color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b',
          path: '/employee/my-leaves',
        }));

        perf.filter(r =>
          r.remarks?.toLowerCase().includes(qLow) ||
          String(r.rating).includes(qLow)
        ).slice(0, 2).forEach(r => found.push({
          id: r._id,
          icon: <Star size={14} />,
          label: `Rating: ${r.rating} / 5`,
          sub: `Evaluated on ${new Date(r.date).toLocaleDateString('en-GB')}`,
          color: '#a855f7',
          path: '/employee/performance',
        }));

        // Quick nav suggestions
        if (!found.length) {
          [
            { label: 'Apply Leave', sub: 'Go to leave application', path: '/employee/apply-leave', icon: <Calendar size={14} />, color: '#38bdf8' },
            { label: 'My Leaves',   sub: 'View your leave history',  path: '/employee/my-leaves',  icon: <Calendar size={14} />, color: '#f59e0b' },
            { label: 'My Profile',  sub: 'View & edit your profile', path: '/employee/profile',     icon: <User size={14} />,     color: '#a855f7' },
          ].filter(s => s.label.toLowerCase().includes(qLow) || s.sub.toLowerCase().includes(qLow))
          .forEach(s => found.push({ ...s, id: s.path }));
        }
      }

      if (role === 'Manager') {
        const [empRes, leavesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, { headers }),
        ]);
        const emps   = empRes.ok   ? await empRes.json()   : [];
        const leaves = leavesRes.ok ? await leavesRes.json() : [];

        emps.filter(e =>
          e.name?.toLowerCase().includes(qLow) ||
          e.email?.toLowerCase().includes(qLow) ||
          e.department?.toLowerCase().includes(qLow) ||
          e.designation?.toLowerCase().includes(qLow)
        ).slice(0, 5).forEach(e => found.push({
          id: e._id,
          icon: <User size={14} />,
          label: e.name,
          sub: `${e.designation || e.role} · ${e.department || 'No dept'}`,
          color: '#3b82f6',
          path: '/manager/team-leaves',
        }));

        leaves.filter(l =>
          l.employee?.name?.toLowerCase().includes(qLow) ||
          l.leaveType?.toLowerCase().includes(qLow) ||
          l.status?.toLowerCase().includes(qLow)
        ).slice(0, 4).forEach(l => found.push({
          id: l._id,
          icon: <Calendar size={14} />,
          label: `${l.employee?.name || 'Unknown'} — ${normalizeType(l.leaveType)} Leave`,
          sub: `${l.status} · ${new Date(l.startDate).toLocaleDateString('en-GB')}`,
          color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b',
          path: '/manager/leave-approvals',
        }));

        if (!found.length) {
          [
            { label: 'Leave Approvals', sub: 'Review pending requests',    path: '/manager/leave-approvals',       icon: <Calendar size={14} />, color: '#f59e0b' },
            { label: 'Team Leaves',     sub: 'See full team leave calendar', path: '/manager/team-leaves',           icon: <Calendar size={14} />, color: '#38bdf8' },
            { label: 'Evaluate Team',   sub: 'Submit performance reviews',  path: '/manager/performance-evaluation', icon: <Star size={14} />,     color: '#a855f7' },
          ].filter(s => s.label.toLowerCase().includes(qLow) || s.sub.toLowerCase().includes(qLow))
          .forEach(s => found.push({ ...s, id: s.path }));
        }
      }

      if (role === 'Admin') {
        const [empRes, leavesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, { headers }),
        ]);
        const emps   = empRes.ok   ? await empRes.json()   : [];
        const leaves = leavesRes.ok ? await leavesRes.json() : [];

        emps.filter(e =>
          e.name?.toLowerCase().includes(qLow) ||
          e.email?.toLowerCase().includes(qLow) ||
          e.role?.toLowerCase().includes(qLow) ||
          e.department?.toLowerCase().includes(qLow)
        ).slice(0, 6).forEach(e => found.push({
          id: e._id,
          icon: <User size={14} />,
          label: e.name,
          sub: `${e.role} · ${e.department || 'No dept'} · ${e.email}`,
          color: e.role === 'Manager' ? '#a855f7' : e.role === 'Admin' ? '#10b981' : '#3b82f6',
          path: '/admin/employees',
        }));

        leaves.filter(l =>
          l.employee?.name?.toLowerCase().includes(qLow) ||
          l.leaveType?.toLowerCase().includes(qLow) ||
          l.status?.toLowerCase().includes(qLow)
        ).slice(0, 3).forEach(l => found.push({
          id: l._id,
          icon: <Calendar size={14} />,
          label: `${l.employee?.name || 'Unknown'} — ${normalizeType(l.leaveType)} Leave`,
          sub: `${l.status} · ${new Date(l.startDate).toLocaleDateString('en-GB')}`,
          color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b',
          path: '/admin/leave-reports',
        }));

        if (!found.length) {
          [
            { label: 'Manage Employees',   sub: 'View all staff records',    path: '/admin/employees',            icon: <User size={14} />,     color: '#3b82f6' },
            { label: 'Leave Reports',       sub: 'System-wide leave data',    path: '/admin/leave-reports',        icon: <Calendar size={14} />, color: '#f59e0b' },
            { label: 'Performance Reports', sub: 'All evaluation summaries',  path: '/admin/performance-reports',  icon: <Star size={14} />,     color: '#a855f7' },
          ].filter(s => s.label.toLowerCase().includes(qLow) || s.sub.toLowerCase().includes(qLow))
          .forEach(s => found.push({ ...s, id: s.path }));
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    }

    setResults(found);
    setOpen(true);
    setLoading(false);
  }, [role]);

  const handleSelect = (result) => {
    navigate(result.path);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const defaultPlaceholder = role === 'Admin' ? 'Search employees, leaves...' : role === 'Manager' ? 'Search team members, requests...' : 'Search leaves, performance...';

  return (
    <div ref={searchRef} style={{ position: 'relative' }}>
      <div className="search-bar" style={{ position: 'relative' }}>
        <Search size={18} className="text-secondary" />
        <input
          type="text"
          placeholder={placeholder || defaultPlaceholder}
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setOpen(true)}
          style={{ flex: 1 }}
        />
        {query && (
          <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '380px', maxHeight: '400px',
          background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={13} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
            </span>
          </div>

          {/* Results */}
          <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
            {results.length === 0 && !loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No results found for "<strong style={{ color: 'var(--text-primary)' }}>{query}</strong>"
              </div>
            ) : (
              results.map((r, i) => (
                <div
                  key={r.id + i}
                  onClick={() => handleSelect(r)}
                  style={{
                    padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', borderBottom: '1px solid var(--surface-border)', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0 }}>
                    {r.icon}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {/* Highlight matched text */}
                      {r.label.split(new RegExp(`(${query})`, 'gi')).map((part, j) =>
                        part.toLowerCase() === query.toLowerCase()
                          ? <mark key={j} style={{ background: `${r.color}30`, color: r.color, borderRadius: '3px', padding: '0 2px' }}>{part}</mark>
                          : part
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
