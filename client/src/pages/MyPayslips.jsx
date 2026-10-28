import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';
import {
  FileText,
  Calendar,
  IndianRupee,
  Printer,
  Eye,
  CheckCircle2,
  ClockAlert,
  Building,
  User,
} from 'lucide-react';

export default function MyPayslips() {
  const { user } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    async function fetchMyPayroll() {
      setLoading(true);
      try {
        const res = await api.get('/payroll/me');
        if (res.data.success) {
          setRecords(res.data.records);
        }
      } catch (err) {
        toast.error('Failed to load payroll history.');
      } finally {
        setLoading(false);
      }
    }
    fetchMyPayroll();
  }, []);

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
            My Payslips & Compensation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal salary records, attendance breakdowns, and official monthly payslips.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="primary">
            {user?.name}
          </Badge>
          <Badge variant="default">
            {user?.designation}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Contracted Monthly CTC
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(user?.monthlySalary)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Base gross monthly salary</p>
        </Card>

        <Card>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Processed Payslips
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {records.length} <span className="text-sm font-normal text-slate-400">months</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Recorded in your company tenure</p>
        </Card>

        <Card>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Employer Organization
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {user?.company?.name}
          </p>
          <p className="text-xs text-slate-400 mt-1">Tenant Code: {user?.company?.code}</p>
        </Card>
      </div>
      <Card
        title="Disbursement History"
        subtitle="Click any month to inspect line-item deductions or generate a printable payslip"
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">LOP Days</th>
                  <th className="py-3 px-4">Earned Gross</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {rec.month}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {rec.workingDays} days
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${rec.lopDays > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {rec.lopDays} days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(rec.grossSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-500">
                      - {formatCurrency(rec.deduction)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(rec.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedPayslip(rec)}
                      >
                        View Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No payroll records found for your account.</p>
            <p className="text-xs text-slate-400 mt-1">Your company administrator will disburse payroll shortly.</p>
          </div>
        )}
      </Card>
      <Modal
        isOpen={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
        title="Employee Monthly Payslip"
        subtitle={`Pay Period: ${selectedPayslip?.month} • ${user?.company?.name}`}
        maxWidth="max-w-2xl"
      >
        {selectedPayslip && (
          <div id="printable-payslip" className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.company?.code?.slice(0, 2) || 'ME'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {user?.company?.name}
                  </h4>
                  <p className="text-xs text-slate-400">Official Monthly Compensation Slip</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                {selectedPayslip.month}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-medium">Employee Name:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Designation:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user?.designation}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Month Working Days:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPayslip.workingDays} days</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Present Days:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedPayslip.presentDays} days</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Loss of Pay (LOP):</span>
                <p className="font-bold text-rose-500 mt-0.5">{selectedPayslip.lopDays} days</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Per-Day Rate:</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹{selectedPayslip.perDaySalary}</p>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-600 dark:text-slate-400">Base Monthly CTC</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(selectedPayslip.monthlySalary)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 text-rose-600 dark:text-rose-400">
                <span>Loss of Pay (LOP) Deduction ({selectedPayslip.lopDays} days)</span>
                <span className="font-mono font-semibold">
                  - {formatCurrency(selectedPayslip.lopAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40">
                <span>Earned Gross Salary</span>
                <span className="font-mono">
                  {formatCurrency(selectedPayslip.grossSalary)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 text-indigo-600 dark:text-indigo-400">
                <span>Statutory Tax & PF Deduction ({selectedPayslip.deductionRate}%)</span>
                <span className="font-mono font-semibold">
                  - {formatCurrency(selectedPayslip.deduction)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span>Net Disbursable Salary</span>
                <span className="font-mono text-xl">
                  {formatCurrency(selectedPayslip.netSalary)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
              <span className="text-[11px] text-slate-400">
                Generated via verified cryptographic tenant context.
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPayslip(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Printer}
                  onClick={handlePrint}
                >
                  Print Payslip
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
