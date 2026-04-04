import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { CloudUpload, Info, PieChart, Calendar as CalendarIcon, Send, Loader2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const indianHolidays = [
  { date: '2026-01-26', name: 'Republic Day (National Holiday)' },
  { date: '2026-03-03', name: 'Holi (Public Holiday)' },
  { date: '2026-04-10', name: 'Good Friday (Public Holiday)' },
  { date: '2026-05-01', name: 'Labour Day (Public Holiday)' },
  { date: '2026-08-15', name: 'Independence Day (National Holiday)' },
  { date: '2026-10-02', name: 'Gandhi Jayanti (National Holiday)' },
  { date: '2026-11-08', name: 'Diwali (Public Holiday)' },
  { date: '2026-12-25', name: 'Christmas Day (Public Holiday)' },
  { date: '2027-01-26', name: 'Republic Day (National Holiday)' }
];

const getNextHoliday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let holiday of indianHolidays) {
    if (new Date(holiday.date) >= today) {
      return holiday;
    }
  }
  return indianHolidays[0];
};

const ApplyLeave = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: 'Annual',
    reason: '',
    supportDoc: null
  });
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef(null);

  const nextHoliday = getNextHoliday();
  const holidayDateObj = new Date(nextHoliday.date);
  const holidayDateStr = holidayDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) {
        toast.error('Document must be under 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, supportDoc: reader.result, supportDocName: file.name });
        toast.success(`${file.name} attached successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both a Start Date and End Date.");
      return;
    }

    const token = localStorage.getItem('employeeToken');
    
    // Support document upload simulation
    const payload = {
      ...formData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Leave application ${formData.supportDocName ? 'and document ' : ''}submitted successfully!`);
        setTimeout(() => navigate('/employee/my-leaves'), 500);
      } else {
        const error = await res.json();
        toast.error('Error: ' + error.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error submitting leave.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: window.innerWidth < 1000 ? 'column' : 'row', gap: '2rem', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start' }}>
      
      {/* Left Column: Form */}
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1.5, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '700' }}>Apply for Leave</h2>
          {submitting && <div className="spinner-mini" style={{ border: '2px solid rgba(37,99,235,0.2)', borderTop: '2px solid var(--primary)', borderRadius: '50%', width:'20px', height:'20px', animation:'spin 0.6s linear infinite' }}></div>}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Leave Type</label>
            <select 
              name="leaveType" 
              className="input-field" 
              value={formData.leaveType} 
              onChange={handleChange}
              style={{ background: '#ffffff' }}
              disabled={submitting}
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Personal">Personal Leave</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Start Date</label>
              <div style={{ width: '100%' }}>
                <DatePicker 
                  selected={startDate} 
                  onChange={(date) => setStartDate(date)} 
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="input-field"
                  style={{ background: '#ffffff' }}
                  required 
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>End Date</label>
              <div style={{ width: '100%' }}>
                <DatePicker 
                  selected={endDate} 
                  onChange={(date) => setEndDate(date)} 
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="input-field"
                  style={{ background: '#ffffff' }}
                  required 
                  minDate={startDate}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Reason for Leave</label>
            <textarea 
              name="reason" 
              className="input-field" 
              rows="4" 
              required 
              onChange={handleChange}
              placeholder="Briefly explain the reason for your request..."
              style={{ resize: 'vertical', background: '#ffffff' }}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Document Upload Area */}
          <div 
            onClick={() => !submitting && fileInputRef.current?.click()}
            style={{ 
              marginTop: '1.5rem', marginBottom: '1.5rem', border: '2px dashed var(--surface-border)', 
              padding: '2.5rem 1rem', borderRadius: '12px', textAlign: 'center', 
              background: 'var(--surface-base)', transition: 'all 0.3s', cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1
            }}
            onMouseOver={(e) => !submitting && (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseOut={(e) => !submitting && (e.currentTarget.style.borderColor = 'var(--surface-border)')}
          >
            <CloudUpload size={32} color="var(--secondary)" style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Drag and drop supporting documents or <span style={{ color: 'var(--primary)', fontWeight: 500 }}>browse</span>
            </div>
            {formData.supportDocName && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                {formData.supportDocName} attached.
              </div>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} {submitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>

      {/* Right Column: Widgets */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        
        {/* Balances Widget */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <PieChart size={24} color="var(--primary)" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Leave Balances</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Annual Leave</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user?.leaveBalance?.Annual || 0} / 20 days</strong>
              </div>
              <div style={{ width: '100%', background: 'var(--surface-border)', height: '6px', borderRadius: '4px' }}>
                <div style={{ width: `${(user?.leaveBalance?.Annual / 20) * 100 || 0}%`, background: 'var(--primary)', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Sick Leave</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user?.leaveBalance?.Sick || 0} / 10 days</strong>
              </div>
              <div style={{ width: '100%', background: 'var(--surface-border)', height: '6px', borderRadius: '4px' }}>
                <div style={{ width: `${(user?.leaveBalance?.Sick / 10) * 100 || 0}%`, background: '#10b981', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Personal Leave</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user?.leaveBalance?.Personal ?? user?.leaveBalance?.Casual ?? 0} / 7 days</strong>
              </div>
              <div style={{ width: '100%', background: 'var(--surface-border)', height: '6px', borderRadius: '4px' }}>
                <div style={{ width: `${((user?.leaveBalance?.Personal ?? user?.leaveBalance?.Casual ?? 0) / 7) * 100 || 0}%`, background: '#f59e0b', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '12px', background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '12px' }}>
            <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Approvals typically take 1-2 business days. You will be notified via email once your manager reviews the request.
            </p>
          </div>
        </div>

        {/* Next Holiday Widget */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', position: 'relative', overflow: 'hidden', border: 'none' }}>
          <CalendarIcon size={120} color="white" style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }} />
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Next Holiday</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{holidayDateStr}</div>
          <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>{nextHoliday.name}</div>
        </div>

      </div>
    </div>
  );
};

export default ApplyLeave;
