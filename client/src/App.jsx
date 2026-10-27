import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import RunPayroll from './pages/RunPayroll';
import CompanySettings from './pages/CompanySettings';
import MyPayslips from './pages/MyPayslips';
import AskAI from './pages/AskAI';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'admin' ? <Dashboard /> : <Navigate to="/my-payslips" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Authenticated App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Dynamic Root Route */}
                <Route path="/" element={<RootRedirect />} />

                {/* Admin Only Routes */}
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RunPayroll />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CompanySettings />
                    </ProtectedRoute>
                  }
                />

                {/* Employee / Self-Service Route */}
                <Route
                  path="/my-payslips"
                  element={
                    <ProtectedRoute allowedRoles={['employee', 'admin']}>
                      <MyPayslips />
                    </ProtectedRoute>
                  }
                />

                {/* Bonus AI Query Assistant (All roles) */}
                <Route
                  path="/ask"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'employee']}>
                      <AskAI />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-All 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
