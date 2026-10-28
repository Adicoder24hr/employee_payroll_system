import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import {
  Users,
  Calendar,
  IndianRupee,
  ClockAlert,
  Calculator,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState('2026-10');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const res = await api.get(`/payroll/summary?month=${currentMonth}`);
        if (res.data.success) {
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching payroll summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [currentMonth]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Payroll Dashboard
            </h1>
            <Badge variant="primary">
              {user?.company?.name || 'Company'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Payroll and attendance for the selected month.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="2026-10" className="dark:bg-slate-900">October 2026</option>
              <option value="2026-09" className="dark:bg-slate-900">September 2026</option>
              <option value="2026-08" className="dark:bg-slate-900">August 2026</option>
            </select>
          </div>

          <Button
            variant="primary"
            icon={Calculator}
            onClick={() => navigate('/payroll')}
          >
            Run Payroll
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Employees
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                  {summary?.totalEmployees || 0}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({summary?.processedEmployees || 0} processed)
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enrolled in {user?.company?.name}
            </p>
          </div>
        </Card>
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Working Days
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                {summary?.workingDays || 26} <span className="text-sm font-medium text-slate-500">days</span>
              </span>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configured for {currentMonth}
            </p>
          </div>
        </Card>
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Net Payroll
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                {formatCurrency(summary?.totalNetPayroll)}
              </span>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Disbursable after deductions
            </p>
          </div>
        </Card>
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Loss of Pay (LOP)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                {summary?.totalLopDays || 0} <span className="text-sm font-medium text-slate-500">days</span>
              </span>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Absences & half-days impact
            </p>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title={`Net Salary Distribution (${currentMonth})`}
          subtitle="Processed net payouts per employee in INR"
        >
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : summary?.monthlyDistribution?.length > 0 ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#888' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#888' }}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [formatCurrency(value), 'Net Salary']}
                  />
                  <Bar
                    dataKey="netSalary"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Calculator className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No payroll processed for {currentMonth} yet.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Click "Run Payroll" to record attendance and compute salary payouts for this month.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/payroll')}
              >
                Compute Now
              </Button>
            </div>
          )}
        </Card>
        <div className="space-y-6">
          <Card
            className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white border-indigo-800 shadow-xl"
            title="Ask AI Query Assistant"
            subtitle="Ask payroll questions"
          >
            <div className="space-y-3.5">
              <p className="text-xs text-indigo-200 leading-relaxed">
                Ask questions about payroll for your company.
              </p>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-mono text-indigo-100 flex items-center justify-between">
                <span>"What is Ramesh's net salary for October?"</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-indigo-950 hover:bg-indigo-50 border-transparent font-semibold"
                onClick={() => navigate('/ask')}
              >
                Launch Ask AI
              </Button>
            </div>
          </Card>

          <Card title="Quick Navigation">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/employees')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Manage Employees
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Configure Working Days
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
      <Card
        title="Recent Payroll Calculations"
        subtitle="Latest processed attendance-to-payroll disbursements in your company"
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : summary?.recentRuns?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">LOP Days</th>
                  <th className="py-3 px-4">Earned Gross</th>
                  <th className="py-3 px-4 text-right">Disbursable Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {summary.recentRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {run.employeeName}
                        </span>
                        <p className="text-xs text-slate-400">{run.designation}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" size="xs">
                        {run.month}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${run.lopDays > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {run.lopDays} days
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(run.grossSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(run.netSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-6 text-center">
            No recent payroll runs recorded.
          </p>
        )}
      </Card>
    </div>
  );
}
