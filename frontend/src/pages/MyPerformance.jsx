import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MyPerformance = () => {
  const { user } = useOutletContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6M'); // '6M' or '1Y'

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="loading-screen">Loading performance data...</div>;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    interval = seconds / 86400;
    if (interval >= 1) {
      const days = Math.floor(interval);
      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        return weeks + (weeks === 1 ? " week ago" : " weeks ago");
      }
      return days + (days === 1 ? " day ago" : " days ago");
    }
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  // Prepare chart data (chronological) logic
  const getChartData = () => {
    // Return all for graph; in real case, slice by 6M or 1Y
    let filteredReviews = [...reviews];
    
    // Sort oldest to newest for the graph
    const sorted = filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter by time range
    if (timeRange === '6M') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filteredReviews = sorted.filter(r => new Date(r.date) >= sixMonthsAgo);
    } else {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filteredReviews = sorted.filter(r => new Date(r.date) >= oneYearAgo);
    }
    
    // If fewer than elements after filtering, let's just use all sorted reviews if needed, or leave it.
    // Let's use whatever is remaining after filter. If empty, fall back to last few sorted reviews to show *something* if available.
    if (filteredReviews.length === 0 && sorted.length > 0) {
      filteredReviews = sorted.slice(-6); // last 6 reviews
    }

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    return filteredReviews.map(r => ({
      name: monthNames[new Date(r.date).getMonth()],
      rating: r.rating
    }));
  };

  const chartData = getChartData();

  // Removed invalid getProfileImageUrl since image is base64

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Chart Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Performance Trends</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Monthly trajectory based on KPI outcomes</p>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setTimeRange('6M')}
              style={{
                padding: '0.4rem 1rem', 
                borderRadius: '6px',
                border: 'none',
                background: timeRange === '6M' ? 'var(--surface-base)' : 'transparent',
                color: timeRange === '6M' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: timeRange === '6M' ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: timeRange === '6M' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}>6 Months</button>
            <button 
              onClick={() => setTimeRange('1Y')}
              style={{
                padding: '0.4rem 1rem', 
                borderRadius: '6px',
                border: 'none',
                background: timeRange === '1Y' ? 'var(--surface-base)' : 'transparent',
                color: timeRange === '1Y' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: timeRange === '1Y' ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: timeRange === '1Y' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}>1 Year</button>
          </div>
        </div>

        <div style={{ width: '100%', height: '280px', marginTop: '1rem' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '1px' }} 
                  dy={10} 
                />
                <YAxis domain={[0, 5.5]} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--surface-hover)', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRating)" 
                  activeDot={{ r: 6, fill: '#2563eb', stroke: 'var(--surface-base)', strokeWidth: 3 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              No performance data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Manager Feedback Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--surface-base)', border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Manager Feedback</h2>
          <button style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>View all history</button>
        </div>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any performance reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {reviews.map((review, index) => (
              <div key={review._id} style={{ 
                padding: '1.5rem 0',
                borderBottom: index !== reviews.length - 1 ? '1px solid var(--surface-border)' : 'none',
                display: 'flex', gap: '1.25rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {review.reviewerId?.profileImage ? (
                    <img 
                      src={review.reviewerId.profileImage} 
                      alt="Manager Avatar" 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '42px', height: '42px', 
                      borderRadius: '50%', background: '#eab308', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                      {review.reviewerId?.name ? review.reviewerId.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {review.reviewerId?.name || 'Manager'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {review.reviewerId?.designation || 'Manager'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {timeAgo(review.date)}</span>
                    
                    {/* Badges based on performance structure */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                      {review.leadershipRating >= 4 && (
                        <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px', letterSpacing: '0.5px' }}>
                          LEADERSHIP
                        </span>
                      )}
                      {review.technicalRating >= 4 && (
                        <span style={{ background: '#d1fae5', color: '#059669', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px', letterSpacing: '0.5px' }}>
                          INNOVATION
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                    "{review.remarks}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPerformance;
