import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Settings,
  Sparkles,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Run Payroll', path: '/payroll', icon: Calculator },
    { name: 'Company Settings', path: '/settings', icon: Settings },
    { name: 'Ask AI', path: '/ask', icon: Sparkles, badge: 'Bonus' },
  ];

  const employeeNavItems = [
    { name: 'My Payslips', path: '/my-payslips', icon: FileText },
    { name: 'Ask AI', path: '/ask', icon: Sparkles, badge: 'Bonus' },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Header with close button */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Menu Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isAdmin ? 'Admin Console' : 'Self Service'}
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/30 dark:border-amber-600/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Tenant Isolation Status Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Tenant Isolated</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Data partitioned cryptographically by verified JWT claims.
          </p>
        </div>
      </aside>
    </>
  );
}
