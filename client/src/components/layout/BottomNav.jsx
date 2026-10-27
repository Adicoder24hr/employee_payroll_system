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
} from 'lucide-react';

export default function BottomNav() {
  const { isAdmin } = useAuth();

  const adminTabs = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Staff', path: '/employees', icon: Users },
    { name: 'Payroll', path: '/payroll', icon: Calculator },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Ask AI', path: '/ask', icon: Sparkles },
  ];

  const employeeTabs = [
    { name: 'My Payslips', path: '/my-payslips', icon: FileText },
    { name: 'Ask AI', path: '/ask', icon: Sparkles },
  ];

  const tabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{tab.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
