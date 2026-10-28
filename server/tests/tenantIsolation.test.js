const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const jwt = require('jsonwebtoken');

let mongoServer;
const TEST_JWT_SECRET = 'test_jwt_secret_key_at_least_32_characters_12345';

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tenant Isolation & RBAC Integration Tests', () => {
  let companyA, companyB;
  let adminA, employeeA1, employeeA2;
  let adminB, employeeB1;
  let tokenAdminA, tokenEmployeeA1, tokenAdminB;
  let payrollRecordA1, payrollRecordB1;

  beforeEach(async () => {
    await Company.deleteMany({});
    await User.deleteMany({});
    await Attendance.deleteMany({});

    const passwordHash = await User.hashPassword('Password123!');

    companyA = await Company.create({
      name: 'Acme Textiles',
      code: 'ACME',
      defaultWorkingDays: 26,
      defaultDeductionPercentage: 10,
    });

    companyB = await Company.create({
      name: 'Bright Foods',
      code: 'BRIGHT',
      defaultWorkingDays: 24,
      defaultDeductionPercentage: 10,
    });

    adminA = await User.create({
      companyId: companyA._id,
      name: 'Admin Acme',
      email: 'admin@acme.com',
      passwordHash,
      role: 'admin',
      monthlySalary: 80000,
    });

    employeeA1 = await User.create({
      companyId: companyA._id,
      name: 'Ramesh Kumar',
      email: 'ramesh@acme.com',
      passwordHash,
      role: 'employee',
      monthlySalary: 60000,
    });

    employeeA2 = await User.create({
      companyId: companyA._id,
      name: 'Priya Sharma',
      email: 'priya@acme.com',
      passwordHash,
      role: 'employee',
      monthlySalary: 55000,
    });

    adminB = await User.create({
      companyId: companyB._id,
      name: 'Admin Bright',
      email: 'admin@bright.com',
      passwordHash,
      role: 'admin',
      monthlySalary: 90000,
    });

    employeeB1 = await User.create({
      companyId: companyB._id,
      name: 'Ramesh Gupta',
      email: 'ramesh@bright.com',
      passwordHash,
      role: 'employee',
      monthlySalary: 52000,
    });

    payrollRecordA1 = await Attendance.create({
      companyId: companyA._id,
      employeeId: employeeA1._id,
      month: '2026-10',
      workingDays: 26,
      presentDays: 22,
      absentDays: 2,
      halfDays: 2,
      lopDays: 3.0,
      monthlySalary: 60000,
      perDaySalary: 2307.69,
      lopAmount: 6923.07,
      grossSalary: 53076.93,
      deductionRate: 10,
      deduction: 5307.69,
      netSalary: 47769.24,
      calculatedBy: adminA._id,
    });

    payrollRecordB1 = await Attendance.create({
      companyId: companyB._id,
      employeeId: employeeB1._id,
      month: '2026-10',
      workingDays: 24,
      presentDays: 20,
      absentDays: 3,
      halfDays: 1,
      lopDays: 3.5,
      monthlySalary: 52000,
      perDaySalary: 2166.67,
      lopAmount: 7583.35,
      grossSalary: 44416.65,
      deductionRate: 10,
      deduction: 4441.67,
      netSalary: 39974.98,
      calculatedBy: adminB._id,
    });

    tokenAdminA = jwt.sign(
      { userId: adminA._id, companyId: companyA._id, role: 'admin' },
      TEST_JWT_SECRET
    );

    tokenEmployeeA1 = jwt.sign(
      { userId: employeeA1._id, companyId: companyA._id, role: 'employee' },
      TEST_JWT_SECRET
    );

    tokenAdminB = jwt.sign(
      { userId: adminB._id, companyId: companyB._id, role: 'admin' },
      TEST_JWT_SECRET
    );
  });

  describe('5. Tenant Isolation Guarantees', () => {
    test("Company A's admin requesting Company B's employee by ID gets 404 Not Found", async () => {
      const res = await request(app)
        .get(`/api/employees/${employeeB1._id}`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("Company A's admin requesting Company B's payroll record gets 404 Not Found", async () => {
      const res = await request(app)
        .get(`/api/payroll/${employeeB1._id}/2026-10`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("Company A's admin listing employees only sees Company A's employees", async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const employeeIds = res.body.employees.map((e) => e._id.toString());

      expect(employeeIds).toContain(employeeA1._id.toString());
      expect(employeeIds).toContain(employeeA2._id.toString());

      expect(employeeIds).not.toContain(employeeB1._id.toString());
      expect(employeeIds).not.toContain(adminB._id.toString());
    });

    test("Company A admin cannot run payroll for Company B employee (returns 404)", async () => {
      const res = await request(app)
        .post('/api/payroll/calculate')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({
          employeeId: employeeB1._id.toString(),
          month: '2026-11',
          attendance: { present: 20, absent: 4, halfDay: 0 },
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Employee not found in your company/);
    });
  });

  describe('6. Role-Based Access Control (RBAC)', () => {
    test('An Employee cannot run payroll (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/payroll/calculate')
        .set('Authorization', `Bearer ${tokenEmployeeA1}`)
        .send({
          employeeId: employeeA1._id.toString(),
          month: '2026-10',
          attendance: { present: 22, absent: 2, halfDay: 2 },
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('An Employee cannot list all company employees (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${tokenEmployeeA1}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test("An Employee reading another employee's payroll in the same company gets 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/payroll/${employeeA2._id}/2026-10`)
        .set('Authorization', `Bearer ${tokenEmployeeA1}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only view your own payroll/);
    });

    test('An Employee CAN read their own payroll record (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/payroll/${employeeA1._id}/2026-10`)
        .set('Authorization', `Bearer ${tokenEmployeeA1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payroll.employeeName).toBe('Ramesh Kumar');
      expect(res.body.payroll.netSalary).toBe(47769.24);
    });

    test("An Employee CAN read their own payroll history via /api/payroll/me", async () => {
      const res = await request(app)
        .get('/api/payroll/me')
        .set('Authorization', `Bearer ${tokenEmployeeA1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.records[0].netSalary).toBe(47769.24);
    });
  });
});
