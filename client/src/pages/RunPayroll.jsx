import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import {
  Calculator,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  TrendingDown,
  IndianRupee,
  Plus,
  Minus,
} from 'lucide-react';

export default function RunPayroll() {
  const { user } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [month, setMonth] = useState('2026-10');
  const [companyConfig, setCompanyConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [presentDays, setPresentDays] = useState(22);
  const [absentDays, setAbsentDays] = useState(2);
  const [halfDays, setHalfDays] = useState(2);

  const [isCalculating, setIsCalculating] = useState(false);
  const [payrollResult, setPayrollResult] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoadingConfig(true);
      try {
        const [compRes, empRes] = await Promise.all([
          api.get('/companies/me'),
          api.get('/employees?role=employee'),
        ]);

        if (compRes.data.success) {
          setCompanyConfig(compRes.data.company);
        }

        if (empRes.data.success && empRes.data.employees.length > 0) {
          setEmployees(empRes.data.employees);
          const ramesh = empRes.data.employees.find((e) => e.name.toLowerCase().includes('ramesh'));
          setSelectedEmployeeId(ramesh ? ramesh._id : empRes.data.employees[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load payroll configuration');
      } finally {
        setLoadingConfig(false);
      }
    }
    loadInitialData();
  }, []);

  const workingDays = companyConfig?.workingDaysConfig?.[month] || companyConfig?.defaultWorkingDays || 26;
  const totalAccountedDays = Number(presentDays) + Number(absentDays) + Number(halfDays);
  const isOverflow = totalAccountedDays > workingDays;
  const unmarkedDays = Math.max(0, workingDays - totalAccountedDays);

  const selectedEmployee = employees.find((e) => e._id === selectedEmployeeId);

  const handleStep = (field, delta) => {
    if (field === 'present') {
      setPresentDays((prev) => Math.max(0, Math.min(workingDays, prev + delta)));
    } else if (field === 'absent') {
      setAbsentDays((prev) => Math.max(0, Math.min(workingDays, prev + delta)));
    } else if (field === 'halfDay') {
      setHalfDays((prev) => Math.max(0, Math.min(workingDays, prev + delta)));
    }
  };

  const handleCalculate = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee.');
      return;
    }

    if (isOverflow) {
      toast.error(`Total marked days (${totalAccountedDays}) exceed month working days (${workingDays}).`);
      return;
    }

    setIsCalculating(true);
    try {
      const res = await api.post('/payroll/calculate', {
        employeeId: selectedEmployeeId,
        month,
        attendance: {
          present: Number(presentDays),
          absent: Number(absentDays),
          halfDay: Number(halfDays),
        },
      });

      if (res.data.success) {
        setPayrollResult(res.data.payroll);
        toast.success(`Payroll computed successfully for ${res.data.payroll.employeeName}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Run Monthly Payroll
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Input monthly attendance tally to compute Loss of Pay (LOP), statutory deductions, and net salary.
          </p>
        </div>

        <Badge variant="primary">
          {user?.company?.name} ({workingDays} Working Days)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <Card title="Attendance & Employee Selector">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Employee *
                </label>
                {loadingConfig ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} — {emp.designation} (₹{emp.monthlySalary?.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Month *
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Company working days for {month}: <strong className="text-slate-700 dark:text-slate-300">{workingDays} days</strong>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Monthly Attendance Counts
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Present Days
                    </span>
                    <p className="text-[11px] text-slate-400">Full day attendance</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStep('present', -1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={workingDays}
                      value={presentDays}
                      onChange={(e) => setPresentDays(Number(e.target.value))}
                      className="w-14 text-center font-bold text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep('present', 1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Absent Days
                    </span>
                    <p className="text-[11px] text-slate-400">1.0 LOP per day</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStep('absent', -1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={workingDays}
                      value={absentDays}
                      onChange={(e) => setAbsentDays(Number(e.target.value))}
                      className="w-14 text-center font-bold text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep('absent', 1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Half Days
                    </span>
                    <p className="text-[11px] text-slate-400">0.5 LOP per day</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStep('halfDay', -1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={workingDays}
                      value={halfDays}
                      onChange={(e) => setHalfDays(Number(e.target.value))}
                      className="w-14 text-center font-bold text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleStep('halfDay', 1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>
              {isOverflow ? (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Total marked days ({totalAccountedDays}) exceed month's working days ({workingDays})!
                  </span>
                </div>
              ) : unmarkedDays > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 text-xs leading-relaxed">
                  Notice: {unmarkedDays} unmarked days will automatically be counted as absent (Loss of Pay).
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>All {workingDays} working days accounted for!</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                disabled={isOverflow || !selectedEmployeeId}
                isLoading={isCalculating}
                onClick={handleCalculate}
                icon={Calculator}
              >
                Compute & Save Payroll
              </Button>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-7 space-y-6">
          {payrollResult ? (
            <div id="printable-payslip" className="space-y-6">
              <Card
                title={`Payroll Breakdown — ${payrollResult.employeeName}`}
                subtitle={`Month: ${payrollResult.month} • Computed via MobiusEMS Engine`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={handlePrint}
                    className="no-print"
                  >
                    Print Payslip
                  </Button>
                }
              >
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Salary Composition</span>
                    <span>Net Disbursable: {formatCurrency(payrollResult.netSalary)}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${(payrollResult.netSalary / payrollResult.monthlySalary) * 100}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title="Net Take-Home"
                    />
                    <div
                      style={{ width: `${(payrollResult.deduction / payrollResult.monthlySalary) * 100}%` }}
                      className="bg-indigo-500 transition-all duration-500"
                      title="Statutory Deductions"
                    />
                    <div
                      style={{ width: `${(payrollResult.lopAmount / payrollResult.monthlySalary) * 100}%` }}
                      className="bg-rose-500 transition-all duration-500"
                      title="LOP Loss"
                    />
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] pt-1">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-slate-500">Net Salary</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                      <span className="text-slate-500">Deductions (10%)</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span className="text-slate-500">Loss of Pay</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Working Days</span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {payrollResult.workingDays}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Present</span>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {payrollResult.presentDays}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LOP Days</span>
                    <p className="text-base font-extrabold text-rose-500 mt-0.5">
                      {payrollResult.lopDays}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Rate</span>
                    <p className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{payrollResult.perDaySalary}
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-600 dark:text-slate-400">Base Monthly CTC</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(payrollResult.monthlySalary)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 text-rose-600 dark:text-rose-400">
                    <div>
                      <span>Loss of Pay (LOP) Deduction</span>
                      <p className="text-xs text-rose-400">{payrollResult.lopDays} days × ₹{payrollResult.perDaySalary}</p>
                    </div>
                    <span className="font-mono font-semibold">
                      - {formatCurrency(payrollResult.lopAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30 px-3 rounded-lg">
                    <span>Earned Gross Salary</span>
                    <span className="font-mono">
                      {formatCurrency(payrollResult.grossSalary)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 text-indigo-600 dark:text-indigo-400">
                    <div>
                      <span>Statutory Deductions (PF / Tax)</span>
                      <p className="text-xs text-indigo-400">Flat {payrollResult.deductionRate}% of earned gross</p>
                    </div>
                    <span className="font-mono font-semibold">
                      - {formatCurrency(payrollResult.deduction)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4 text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 rounded-lg">
                    <span>Disbursable Net Salary</span>
                    <span className="font-mono text-xl">
                      {formatCurrency(payrollResult.netSalary)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="h-96 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Awaiting Calculation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Choose an employee from the left panel and click <strong>"Compute & Save Payroll"</strong> to render the financial breakdown and printable payslip.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
