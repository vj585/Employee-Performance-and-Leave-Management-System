import React from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System preferences saved successfully!');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>System Configurations</h2>
      
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.1rem' }}>Notification Policies</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="emailNotifs" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
            <label htmlFor="emailNotifs" style={{ color: 'var(--text-primary)' }}>Enable email notifications for Leave Requests</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="perfNotifs" defaultChecked={false} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
            <label htmlFor="perfNotifs" style={{ color: 'var(--text-primary)' }}>Notify employees immediately upon Performance Publishing</label>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.1rem' }}>Default System Quotas</h4>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" style={{ color: 'var(--text-secondary)' }}>Annual Leave (Days)</label>
              <input type="number" className="input-field" defaultValue={20} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" style={{ color: 'var(--text-secondary)' }}>Sick Leave (Days)</label>
              <input type="number" className="input-field" defaultValue={10} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" style={{ color: 'var(--text-secondary)' }}>Personal Leave (Days)</label>
              <input type="number" className="input-field" defaultValue={7} />
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>*Changing these global variables will only affect newly created employee accounts.</p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
          <Save size={18} /> Save Settings
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
