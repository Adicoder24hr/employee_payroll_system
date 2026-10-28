require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { calculatePayroll } = require('../utils/payrollCalculator');

const DEFAULT_PASSWORD = 'Password123!';

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[Seed Error] MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[Seed] Connected successfully.');

  console.log('[Seed] Clearing existing collections...');
  await Company.deleteMany({});
  await User.deleteMany({});
  await Attendance.deleteMany({});

  const passwordHash = await User.hashPassword(DEFAULT_PASSWORD);

  console.log('[Seed] Creating Company A (Acme Textiles)...');
  const companyA = await Company.create({
    name: 'Acme Textiles',
    code: 'ACME',
    defaultWorkingDays: 26,
    defaultDeductionPercentage: 10,
    workingDaysConfig: {
      '2026-08': 26,
      '2026-09': 25,
      '2026-10': 26,
    },
  });

  console.log('[Seed] Creating Company B (Bright Foods)...');
  const companyB = await Company.create({
    name: 'Bright Foods',
    code: 'BRIGHT',
    defaultWorkingDays: 24,
    defaultDeductionPercentage: 10,
    workingDaysConfig: {
      '2026-08': 24,
      '2026-09': 24,
      '2026-10': 24,
    },
  });

  console.log('[Seed] Creating users for Company A...');
  const acmeAdmin = await User.create({
    companyId: companyA._id,
    name: 'Acme Admin',
    email: 'admin@acme.com',
    passwordHash,
    role: 'admin',
    designation: 'HR Administrator',
    monthlySalary: 85000,
    isActive: true,
  });

  const rameshA = await User.create({
    companyId: companyA._id,
    name: 'Ramesh Kumar',
    email: 'ramesh@acme.com',
    passwordHash,
    role: 'employee',
    designation: 'Senior Loom Supervisor',
    monthlySalary: 60000,
    isActive: true,
  });

  const priyaA = await User.create({
    companyId: companyA._id,
    name: 'Priya Sharma',
    email: 'priya@acme.com',
    passwordHash,
    role: 'employee',
    designation: 'Quality Control Lead',
    monthlySalary: 55000,
    isActive: true,
  });

  const amitA = await User.create({
    companyId: companyA._id,
    name: 'Amit Patel',
    email: 'amit@acme.com',
    passwordHash,
    role: 'employee',
    designation: 'Inventory Specialist',
    monthlySalary: 45000,
    isActive: true,
  });

  const sunitaA = await User.create({
    companyId: companyA._id,
    name: 'Sunita Rao',
    email: 'sunita@acme.com',
    passwordHash,
    role: 'employee',
    designation: 'Production Executive',
    monthlySalary: 50000,
    isActive: true,
  });

  console.log('[Seed] Creating users for Company B...');
  const brightAdmin = await User.create({
    companyId: companyB._id,
    name: 'Bright Admin',
    email: 'admin@bright.com',
    passwordHash,
    role: 'admin',
    designation: 'Operations Director',
    monthlySalary: 90000,
    isActive: true,
  });

  const rameshB = await User.create({
    companyId: companyB._id,
    name: 'Ramesh Gupta',
    email: 'ramesh@bright.com',
    passwordHash,
    role: 'employee',
    designation: 'Packaging Line Manager',
    monthlySalary: 52000,
    isActive: true,
  });

  const nehaB = await User.create({
    companyId: companyB._id,
    name: 'Neha Verma',
    email: 'neha@bright.com',
    passwordHash,
    role: 'employee',
    designation: 'Food Technologist',
    monthlySalary: 62000,
    isActive: true,
  });

  const vikramB = await User.create({
    companyId: companyB._id,
    name: 'Vikram Singh',
    email: 'vikram@bright.com',
    passwordHash,
    role: 'employee',
    designation: 'Supply Chain Analyst',
    monthlySalary: 48000,
    isActive: true,
  });

  const poojaB = await User.create({
    companyId: companyB._id,
    name: 'Pooja Nair',
    email: 'pooja@bright.com',
    passwordHash,
    role: 'employee',
    designation: 'Quality Auditor',
    monthlySalary: 54000,
    isActive: true,
  });

  console.log('[Seed] Seeding historical attendance and payroll calculations...');

  async function recordPayroll(company, employee, admin, month, present, absent, halfDay) {
    const workingDays = company.getWorkingDaysForMonth(month);
    const result = calculatePayroll({
      monthlySalary: employee.monthlySalary,
      workingDays,
      presentDays: present,
      absentDays: absent,
      halfDays: halfDay,
      deductionPercentage: company.defaultDeductionPercentage,
      month,
    });

    await Attendance.create({
      companyId: company._id,
      employeeId: employee._id,
      month,
      workingDays: result.workingDays,
      presentDays: result.presentDays,
      absentDays: result.absentDays,
      halfDays: result.halfDays,
      unmarkedDays: result.unmarkedDays,
      lopDays: result.lopDays,
      monthlySalary: result.monthlySalary,
      perDaySalary: result.perDaySalary,
      lopAmount: result.lopAmount,
      grossSalary: result.grossSalary,
      deductionRate: result.deductionRate,
      deduction: result.deduction,
      netSalary: result.netSalary,
      calculatedBy: admin._id,
    });
  }

  await recordPayroll(companyA, rameshA, acmeAdmin, '2026-10', 22, 2, 2);
  await recordPayroll(companyA, rameshA, acmeAdmin, '2026-09', 25, 0, 0);
  await recordPayroll(companyA, rameshA, acmeAdmin, '2026-08', 24, 2, 0);

  await recordPayroll(companyA, priyaA, acmeAdmin, '2026-10', 24, 1, 1);
  await recordPayroll(companyA, priyaA, acmeAdmin, '2026-09', 23, 2, 0);

  await recordPayroll(companyA, amitA, acmeAdmin, '2026-10', 26, 0, 0);

  await recordPayroll(companyA, sunitaA, acmeAdmin, '2026-10', 23, 2, 1);

  await recordPayroll(companyB, rameshB, brightAdmin, '2026-10', 20, 3, 1);
  await recordPayroll(companyB, rameshB, brightAdmin, '2026-09', 24, 0, 0);

  await recordPayroll(companyB, nehaB, brightAdmin, '2026-10', 22, 2, 0);

  await recordPayroll(companyB, vikramB, brightAdmin, '2026-10', 21, 1, 2);

  await recordPayroll(companyB, poojaB, brightAdmin, '2026-10', 24, 0, 0);

  console.log('\n============================================================');
  console.log('✅ DATABASE SEEDING COMPLETE');
  console.log('============================================================');
  console.log('\nDemo Credentials:\n');
  console.log('--- COMPANY A: Acme Textiles (Working Days: 26) ---');
  console.log('Admin:    admin@acme.com    | Password: Password123!');
  console.log('Employee: ramesh@acme.com   | Password: Password123! (Ramesh Kumar, CTC ₹60,000)');
  console.log('Employee: priya@acme.com    | Password: Password123! (Priya Sharma, CTC ₹55,000)');
  console.log('Employee: amit@acme.com     | Password: Password123! (Amit Patel, CTC ₹45,000)');
  console.log('Employee: sunita@acme.com   | Password: Password123! (Sunita Rao, CTC ₹50,000)\n');

  console.log('--- COMPANY B: Bright Foods (Working Days: 24) ---');
  console.log('Admin:    admin@bright.com  | Password: Password123!');
  console.log('Employee: ramesh@bright.com | Password: Password123! (Ramesh Gupta, CTC ₹52,000)');
  console.log('Employee: neha@bright.com   | Password: Password123! (Neha Verma, CTC ₹62,000)');
  console.log('Employee: vikram@bright.com | Password: Password123! (Vikram Singh, CTC ₹48,000)');
  console.log('Employee: pooja@bright.com  | Password: Password123! (Pooja Nair, CTC ₹54,000)');
  console.log('============================================================\n');

  await mongoose.disconnect();
  console.log('[Seed] Database disconnected cleanly.');
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[Seed Fatal Error]:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
