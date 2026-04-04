import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Cpu, Lightbulb, Send, ArrowLeft, User, Calendar } from 'lucide-react';

/* ─── Static slider CSS — no transitions, solid blue ─────────────────────── */
const sliderCss = `
  .eval-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 99px;
    background: #2563eb;
    outline: none;
    cursor: pointer;
    border: none;
    display: block;
    transition: none;
  }
  .eval-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #2563eb;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    cursor: grab;
    transition: none;
  }
  .eval-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #2563eb;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    cursor: grab;
    transition: none;
  }
  .eval-slider:active::-webkit-slider-thumb { cursor: grabbing; }
  .eval-slider:active::-moz-range-thumb    { cursor: grabbing; }
`;

/* ─── Single slider card ─────────────────────────────────────────────────── */
const SliderRating = ({ name, label, icon: Icon, value, onChange }) => (
  <div style={{
    background: 'var(--surface-hover)',
    border: '1px solid var(--surface-border)',
    borderRadius: '14px',
    padding: '0.9rem 1.2rem',
    flex: 1,
    minWidth: '180px',
  }}>
    {/* Label */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
      <div style={{ padding: '6px', background: 'var(--primary-glow)', borderRadius: '8px', color: 'var(--primary)', flexShrink: 0 }}>
        <Icon size={14} />
      </div>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
    </div>

    {/* Slider — inside a fixed-height, overflow-hidden box to prevent layout shift */}
    <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
      <input
        type="range"
        className="eval-slider"
        min={1}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
      />
    </div>

    {/* Tick marks — fixed width chars, won't shift layout */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', paddingLeft: '1px', paddingRight: '1px' }}>
      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(n => (
        <span key={n} style={{
          fontSize: '0.68rem',
          color: '#64748b',
          fontWeight: 400,
          width: '16px',
          textAlign: 'center',
          display: 'inline-block',
        }}>
          {Number.isInteger(n) ? n : '|'}
        </span>
      ))}
    </div>

    {/* Score — fixed height so it never shifts the card */}
    <div style={{ textAlign: 'center', marginTop: '0.7rem', height: '34px', lineHeight: '34px' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }}>{value}</span>
      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}> / 5</span>
    </div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────────────────── */
const PerformanceEvaluation = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [searchParams] = useSearchParams();
  const prefilledId = searchParams.get('employeeId') || '';

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    userId: prefilledId,
    rating: 3,
    technicalRating: 3,
    leadershipRating: 3,
    remarks: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setEmployees(data.filter(e => e.role === 'Employee'));
      } catch (err) { console.error(err); }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRating = (name, val) => setFormData(prev => ({ ...prev, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) { toast.error('Please select an employee'); return; }
    const token = localStorage.getItem('employeeToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Performance evaluation published successfully!');
        setFormData(prev => ({ ...prev, remarks: '', rating: 3, technicalRating: 3, leadershipRating: 3, userId: '' }));
      } else {
        const err = await res.json();
        toast.error('Error: ' + err.message);
      }
    } catch {
      toast.error('Network error submitting evaluation.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <style>{sliderCss}</style>

      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #2563eb, #a855f7)' }} />

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Employee Performance Review</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Provide objective feedback and evaluate competency levels for annual appraisals.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Employee + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Subject Employee
              </label>
              <select name="userId" className="input-field" value={formData.userId} onChange={handleChange} required
                style={{ height: '50px', borderRadius: '12px' }}>
                <option value="">Select someone from your team...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} — {emp.designation || emp.department || 'Staff'}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Evaluation Date
              </label>
              <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} required
                style={{ height: '50px', borderRadius: '12px' }} />
            </div>
          </div>

          {/* Sliders */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Rating Competencies</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>Slide to rate from 1 to 5 — half steps (1.5, 2.5 …) supported.</p>
            
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              <SliderRating name="technicalRating"  label="Technical Skill" icon={Cpu}       value={formData.technicalRating}  onChange={handleRating} />
              <SliderRating name="leadershipRating" label="Leadership"      icon={Shield}    value={formData.leadershipRating} onChange={handleRating} />
            </div>
            
            <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(37,99,235,0.03)', borderRadius: '16px', border: '1px solid rgba(37,99,235,0.08)' }}>
              <SliderRating name="rating" label="Overall Rating (Master Score)" icon={Lightbulb} value={formData.rating} onChange={handleRating} />
            </div>
          </div>

          {/* Remarks */}
          <div className="input-group" style={{ marginBottom: '2.5rem' }}>
            <label className="input-label">Detailed Feedback &amp; Evaluation Remarks</label>
            <div style={{ position: 'relative' }}>
              <textarea
                name="remarks"
                className="input-field"
                rows="6"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="What did this employee excel at this month? Where can they improve?"
                required
                style={{ resize: 'none', padding: '1.2rem', borderRadius: '16px', fontSize: '0.95rem', lineHeight: '1.6' }}
              />
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                {formData.remarks.length} chars
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.05rem', gap: '10px' }}>
            Publish Results <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerformanceEvaluation;
