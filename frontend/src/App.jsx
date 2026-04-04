import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import EmployeeLayout from './components/EmployeeLayout';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import MyPerformance from './pages/MyPerformance';
import Profile from './pages/Profile';
import ManagerLayout from './components/ManagerLayout';
import ManagerDashboard from './pages/ManagerDashboard';
import LeaveApprovals from './pages/LeaveApprovals';
import TeamLeaves from './pages/TeamLeaves';
import PerformanceEvaluation from './pages/PerformanceEvaluation';
import TeamPerformance from './pages/TeamPerformance';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './pages/AdminEmployees';
import LeaveReports from './pages/LeaveReports';
import PerformanceReports from './pages/PerformanceReports';
import AdminSettings from './pages/AdminSettings';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
        <Route path="/login" element={<AuthPage />} />

        {/* Employee Routes Layout Layer */}
        <Route 
          path="/employee" 
          element={
            <PrivateRoute allowedRoles={['Employee']}>
              <EmployeeLayout />
            </PrivateRoute>
          } 
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apply-leave" element={<ApplyLeave />} />
          <Route path="my-leaves" element={<MyLeaves />} />
          <Route path="performance" element={<MyPerformance />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Manager Routes */}
        <Route 
          path="/manager" 
          element={
            <PrivateRoute allowedRoles={['Manager', 'Admin']}>
              <ManagerLayout />
            </PrivateRoute>
          } 
        >
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="leave-approvals" element={<LeaveApprovals />} />
          <Route path="team-leaves" element={<TeamLeaves />} />
          <Route path="performance-evaluation" element={<PerformanceEvaluation />} />
          <Route path="team-performance" element={<TeamPerformance />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </PrivateRoute>
          } 
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="leave-reports" element={<LeaveReports />} />
          <Route path="performance-reports" element={<PerformanceReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Default route redirect based on authentication status */}
        <Route path="*" element={<PrivateRoute><Navigate to="/employee/dashboard" replace /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
