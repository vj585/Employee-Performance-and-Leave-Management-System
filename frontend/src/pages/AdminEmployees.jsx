import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Edit2, Trash2, X } from 'lucide-react';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    _id: '', name: '', email: '', password: '', role: 'Employee', department: '', designation: ''
  });

  const fetchEmployees = async () => {
    const token = localStorage.getItem('employeeToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ _id: '', name: '', email: '', password: '', role: 'Employee', department: '', designation: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setFormData({ ...emp, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this employee?")) return;
    const token = localStorage.getItem('employeeToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        const err = await res.json();
        toast.error('Error: ' + err.message);
      }
    } catch (err) {
      toast.error('Network error deleting employee');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('employeeToken');
    const url = isEditMode ? `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/employees/${formData._id}` : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/employees`;
    const method = isEditMode ? 'PUT' : 'POST';

    // Don't send empty password if editing
    const payload = { ...formData };
    if (isEditMode && !payload.password) delete payload.password;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Employee ${isEditMode ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        const err = await res.json();
        toast.error('Error: ' + err.message);
      }
    } catch (err) {
      toast.error(`Network error ${isEditMode ? 'updating' : 'creating'} employee`);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading) return <div className="loading-screen">Loading Directory...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Manage Directory</h2>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-secondary)" />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {isEditMode ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>Full Name</label>
                  <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>Email Address</label>
                  <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>Role</label>
                  <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>{isEditMode ? 'New Password (Optional)' : 'Initial Password'}</label>
                  <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required={!isEditMode} placeholder={isEditMode ? "Leave blank to keep" : "••••••••"} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>Department</label>
                  <input type="text" name="department" className="input-field" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary text-sm" style={{display:'block', marginBottom: '0.3rem'}}>Designation</label>
                  <input type="text" name="designation" className="input-field" value={formData.designation} onChange={handleChange} placeholder="e.g. Frontend Dev" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                {isEditMode ? 'Save Changes' : 'Create Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {employees.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No employees found in the system.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contact Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Department</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                    {emp.profileImage ? <img src={emp.profileImage} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : emp.name.charAt(0)}
                  </div>
                  <div>
                    {emp.name}
                    {emp.designation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>{emp.designation}</div>}
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{emp.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    background: emp.role === 'Admin' ? 'rgba(239, 68, 68, 0.15)' : emp.role === 'Manager' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                    color: emp.role === 'Admin' ? '#ef4444' : emp.role === 'Manager' ? '#3b82f6' : '#f59e0b',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600
                  }}>
                    {emp.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{emp.department || 'Unassigned'}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleOpenEdit(emp)} style={{ background: 'var(--surface-hover)', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--surface-border)', color: '#10b981', cursor: 'pointer' }} title="Edit"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(emp._id)} style={{ background: 'var(--surface-hover)', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--surface-border)', color: '#ef4444', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminEmployees;
