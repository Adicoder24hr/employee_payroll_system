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
  Building2,
  Calendar,
  Save,
  CheckCircle,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export default function CompanySettings() {
  const { user } = useAuth();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [targetMonth, setTargetMonth] = useState('2026-11');
  const [monthDays, setMonthDays] = useState(25);
  const [defaultDays, setDefaultDays] = useState(26);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies/me');
      if (res.data.success) {
        setCompany(res.data.company);
        setDefaultDays(res.data.company.defaultWorkingDays || 26);
      }
    } catch (err) {
      toast.error('Failed to load company settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleSaveWorkingDays = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/companies/me/working-days', {
        month: targetMonth,
        days: Number(monthDays),
        defaultWorkingDays: Number(defaultDays),
      });

      if (res.data.success) {
        setCompany(res.data.company);
        toast.success(`Working days configuration saved successfully!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Company Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure organization working days calendars and tenant parameters.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <>
          <Card
            title="Tenant Profile & Cryptographic Scope"
            subtitle="Parameters tied to the authenticated JWT context"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Organization Name
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {company?.name}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Company Code / Slug
                </span>
                <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {company?.code}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Default Statutory Deduction
                </span>
                <p className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {company?.defaultDeductionPercentage || 10}%
                </p>
              </div>
            </div>
          </Card>
          <Card
            title="Monthly Working Days Schedule"
            subtitle="Configure calendar working days per month (used for LOP rate calculation)"
          >
            <form onSubmit={handleSaveWorkingDays} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Default Working Days (Fallback)"
                  type="number"
                  min="1"
                  max="31"
                  value={defaultDays}
                  onChange={(e) => setDefaultDays(e.target.value)}
                  helperText="Used when a month has no specific override (e.g. 26)"
                  required
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Specific Month Override
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="month"
                      value={targetMonth}
                      onChange={(e) => setTargetMonth(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthDays}
                      onChange={(e) => setMonthDays(e.target.value)}
                      placeholder="Days (e.g. 24)"
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Set specific working days for {targetMonth}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Active Monthly Configurations
                </label>
                <div className="flex flex-wrap gap-2">
                  {company?.workingDaysConfig && Object.keys(company.workingDaysConfig).length > 0 ? (
                    Object.entries(company.workingDaysConfig).map(([m, d]) => (
                      <span
                        key={m}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-medium"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{m}: <strong>{d} days</strong></span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No monthly overrides set yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  icon={Save}
                >
                  Save Configuration
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
