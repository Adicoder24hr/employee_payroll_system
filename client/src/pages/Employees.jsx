import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Briefcase,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    designation: '',
    monthlySalary: '',
    role: 'employee',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async (searchTerm = '') => {
    setLoading(true);
    try {
      const url = searchTerm ? `/employees?search=${encodeURIComponent(searchTerm)}` : '/employees';
      const res = await api.get(url);
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.monthlySalary) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        toast.success(`Employee ${res.data.employee.name} created successfully!`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: 'Password123!',
          designation: '',
          monthlySalary: '',
          role: 'employee',
        });
        fetchEmployees(search);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Company Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage employees and compensation profiles enrolled in {user?.company?.name}.
          </p>
        </div>

        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Employee
        </Button>
      </div>
      <Card noPadding className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search employees by name, email, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </Card>
      <Card
        title={`Staff Members (${employees.length})`}
        subtitle={`Exclusively filtered for ${user?.company?.name}`}
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : employees.length > 0 ? (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Monthly CTC</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {emp.name}
                            </p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {emp.designation || 'Staff'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={emp.role === 'admin' ? 'primary' : 'default'} size="xs">
                          {emp.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(emp.monthlySalary)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Badge variant={emp.isActive ? 'success' : 'danger'} size="xs">
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {emp.name}
                        </h4>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                    <Badge variant={emp.role === 'admin' ? 'primary' : 'default'} size="xs">
                      {emp.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500">{emp.designation}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(emp.monthlySalary)}/mo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No employees found.</p>
            {search && <p className="text-xs mt-1">Try clearing your search query.</p>}
          </div>
        )}
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Employee"
        subtitle={`Enrolling in ${user?.company?.name}`}
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Priya Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Work Email *"
            type="email"
            placeholder="e.g. priya@acme.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Temporary Password *"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="Default: Password123!"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation"
              placeholder="e.g. Senior Analyst"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <Input
              label="Monthly Gross Salary (INR) *"
              type="number"
              placeholder="e.g. 60000"
              value={formData.monthlySalary}
              onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="employee">Employee (Self-service payslips only)</option>
              <option value="admin">Administrator (Company-wide payroll access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
