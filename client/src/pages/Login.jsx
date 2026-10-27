import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import {
  Lock,
  Mail,
  Building,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const { login } = useAuth();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password, companyCode);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      const target = loggedUser.role === 'employee' ? '/my-payslips' : (location.state?.from?.pathname || '/');
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword, label) => {
    setDemoLoading(label);
    try {
      const loggedUser = await login(demoEmail, demoPassword);
      toast.success(`Logged in as ${loggedUser.name} (${loggedUser.company?.name})`);
      const target = loggedUser.role === 'employee' ? '/my-payslips' : '/';
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all shadow-sm"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Brand Hero Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-12 text-white flex-col justify-between overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-200 mb-8">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>MobiusEMS Enterprise Payroll Engine</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Multi-Tenant Attendance & Deterministic Payroll
          </h1>
          <p className="mt-4 text-slate-300 text-base max-w-lg leading-relaxed">
            Enterprise data isolation, verified role-based access, and an AI-driven payroll query assistant engineered for precision.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Strict Multi-Tenant Isolation</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Company A and Company B data are permanently segregated via JWT claims and compound MongoDB indexes.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Deterministic Calculations</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact Loss of Pay (LOP), statutory deductions, and net payouts computed using pure financial functions.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Developed for Mobius Bloom Ventures • Candidate: Aditya Bhalerao
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4 font-bold text-lg">
              M
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage company payroll or view your personal payslips.
            </p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 1-Click Quick Demo Access
              </span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Ready to test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@acme.com', 'Password123!', 'acme')}
                disabled={Boolean(demoLoading)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-sm transition-all"
              >
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Acme Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">Company A</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@bright.com', 'Password123!', 'bright')}
                disabled={Boolean(demoLoading)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-sm transition-all"
              >
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Bright Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">Company B</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ramesh@acme.com', 'Password123!', 'ramesh')}
                disabled={Boolean(demoLoading)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-sm transition-all"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ramesh</span>
                <span className="text-[10px] text-slate-400 font-normal">Employee (Acme)</span>
              </button>
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="admin@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Company Code (Optional)"
              type="text"
              icon={Building}
              placeholder="e.g. ACME or BRIGHT"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              helperText="Optional for globally unique emails"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Default password for all seeded accounts: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
