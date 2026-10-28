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
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<RootRedirect />} />
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
                <Route
                  path="/my-payslips"
                  element={
                    <ProtectedRoute allowedRoles={['employee', 'admin']}>
                      <MyPayslips />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ask"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'employee']}>
                      <AskAI />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
