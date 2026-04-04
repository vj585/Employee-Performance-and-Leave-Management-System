import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Choose endpoint based on login or signup
    const endpoint = isLogin 
      ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/login` 
      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/register`;
      
    // Create payload
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          // ── LOGIN: store token and redirect to role-based dashboard ──
          toast.success('Welcome back! Redirecting to your dashboard... 🎉');
          login(data, data.token);
          if (data.role === 'Admin') {
            navigate('/admin/dashboard');
          } else if (data.role === 'Manager') {
            navigate('/manager/dashboard');
          } else {
            navigate('/employee/dashboard');
          }
        } else {
          // ── SIGN UP: show success and redirect back to login form ──
          toast.success('Account created successfully! Please sign in to continue. ✅');
          setFormData({ name: '', email: '', password: '', role: 'Employee' });
          setIsLogin(true);
        }
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error('Network Error! Make sure your backend server is running on port 5000.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Decorative background elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <div className="logo-icon mx-auto">
            <ShieldCheck size={36} color="var(--primary)" />
          </div>
          <h1 className="auth-title mt-4">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-subtitle mt-2 text-muted">
            {isLogin 
              ? 'Enter your credentials to access your dashboard' 
              : 'Join the Employee Performance & Leave System'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form mt-8 delay-1">
          {!isLogin && (
            <div className="form-group mb-4">
              <label className="form-label text-sm text-secondary">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="name" 
                  className="auth-input" 
                  placeholder="Enter your full name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group mb-4">
            <label className="form-label text-sm text-secondary">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email" 
                className="auth-input" 
                placeholder="Enter your email address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label text-sm text-secondary flex justify-between">
              <span>Password</span>
              {isLogin && <a href="#" className="forgot-link text-primary text-xs">Forgot?</a>}
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password" 
                className="auth-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group mb-6">
              <label className="form-label text-sm text-secondary">Role</label>
              <div className="input-wrapper">
                <select 
                  name="role" 
                  className="auth-input auth-select" 
                  value={formData.role} 
                  onChange={handleChange}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn btn-primary w-full mt-2" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            <span>{isLoading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer text-center mt-8 delay-2">
          <p className="text-sm text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              className="toggle-auth ml-2 text-primary font-medium" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
