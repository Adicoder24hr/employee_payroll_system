const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function buildProjectGuidePdf() {
  const outputPath = path.resolve(__dirname, '../../../PROJECT_GUIDE.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const PRIMARY = '#4338ca';
  const TEXT = '#1e293b';
  const MUTED = '#64748b';
  const LIGHT_BG = '#f8fafc';
  const BORDER = '#cbd5e1';
  const ACCENT = '#059669';
  function addTitlePage() {
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

    doc.fillColor('#818cf8').fontSize(14).font('Helvetica-Bold')
      .text('MOBIUS BLOOM VENTURES PVT. LTD. (MobiusEMS / Whalexy)', 50, 180, { align: 'center' });

    doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold')
      .text('Multi-Tenant Attendance & Deterministic Payroll Engine', 50, 215, { align: 'center' });

    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
      .text('System Documentation', 50, 280, { align: 'center' });

    doc.rect(150, 320, doc.page.width - 300, 2).fill('#4f46e5');

    doc.fillColor('#e2e8f0').fontSize(12).font('Helvetica')
      .text('Candidate: Aditya Bhalerao', 50, 360, { align: 'center' })
      .text('Role: Full-Stack Developer (Round 2 Take-Home Assessment)', 50, 385, { align: 'center' })
      .text('Date: October 2026', 50, 410, { align: 'center' });

    doc.rect(80, 500, doc.page.width - 160, 160).fillAndStroke('#1e293b', '#334155');
    doc.fillColor('#38bdf8').fontSize(11).font('Helvetica-Bold')
      .text('KEY DELIVERABLES INCLUDED IN THIS GUIDE', 100, 520);

    doc.fillColor('#cbd5e1').fontSize(10).font('Helvetica')
      .text('• End-to-End Multi-Tenant Isolation & Zero-Leaked 404 HTTP Semantics', 100, 545)
      .text('• Pure Deterministic Payroll Engine & 20 Passing Automated Tests', 100, 565)
      .text('• Mobile-First React (Vite) UI with Dark/Light Mode & 1-Click Demo Logins', 100, 585)
      .text('• Payroll Query Endpoint', 100, 605)
      .text('• Detailed Code Tour, Formula Walkthrough & 6 Interview Model Answers', 100, 625);

    doc.addPage();
  }

  function addHeader(title) {
    doc.fillColor(PRIMARY).fontSize(18).font('Helvetica-Bold').text(title);
    doc.strokeColor(PRIMARY).lineWidth(1.5).moveTo(50, doc.y + 4).lineTo(doc.page.width - 50, doc.y + 4).stroke();
    doc.moveDown(1.2);
  }

  function addSubHeader(subtitle) {
    doc.fillColor(TEXT).fontSize(13).font('Helvetica-Bold').text(subtitle);
    doc.moveDown(0.5);
  }

  function addParagraph(text) {
    doc.fillColor(TEXT).fontSize(9.5).font('Helvetica').lineGap(3).text(text);
    doc.moveDown(0.8);
  }

  function addBullet(bulletText) {
    doc.fillColor(TEXT).fontSize(9.5).font('Helvetica').lineGap(2)
      .text(`  •  ${bulletText}`, { indent: 10 });
    doc.moveDown(0.4);
  }

  function addCodeBlock(code) {
    const startY = doc.y;
    doc.fillColor(TEXT).fontSize(8).font('Courier');
    const height = doc.heightOfString(code, { width: doc.page.width - 120 });
    doc.rect(50, startY, doc.page.width - 100, height + 14).fill('#f1f5f9');
    doc.fillColor('#0f172a').text(code, 60, startY + 7, { width: doc.page.width - 120 });
    doc.y = startY + height + 20;
    doc.font('Helvetica');
  }

  addTitlePage();

  addHeader('Table of Contents');
  addParagraph('This reference guide documents the architecture, implementation choices, and operational instructions for the project.');
  addBullet('1. Project Overview & Requirements Satisfied');
  addBullet('2. System Architecture & Directory Structure');
  addBullet('3. Getting Started: Installation, Seeding & Execution');
  addBullet('4. Demo Credentials & Step-by-Step Reviewer Tour');
  addBullet('5. Pure Payroll Calculation Engine & Worked Example');
  addBullet('6. Multi-Tenancy Enforcement & RBAC Security Guarantees');
  addBullet('7. File-by-File Code Tour & End-to-End Request Flow');
  addBullet('8. Bonus Natural Language Query Assistant (POST /api/ask)');
  addBullet('9. Assumptions, Known Limitations & Architectural Trade-offs');
  addBullet('10. Likely Technical Interview Questions & Model Answers');
  addBullet('11. Deployment (Render + Vercel)');
  doc.moveDown(2);

  addHeader('1. Project Overview & Requirements Satisfied');
  addParagraph('This system was developed as a Round 2 take-home engineering assessment for Mobius Bloom Ventures Pvt. Ltd. (MobiusEMS / Whalexy). It solves the problem of automated attendance aggregation and monthly salary disbursement across multiple corporate tenants.');
  addSubHeader('Core Requirements Fully Met:');
  addBullet('Two distinct companies (Acme Textiles & Bright Foods), each configured with distinct working days (26 and 24 days).');
  addBullet('Deterministic payroll endpoint calculating Loss of Pay (LOP) days, earned gross salary, 10% statutory tax/PF deductions, and final net payouts.');
  addBullet('Role-Based Access Control (RBAC): Admin can manage and run payroll for anyone in their organization; Employee can only view their own records.');
  addBullet('Cryptographic Multi-Tenancy: Company A data is strictly invisible to Company B. Cross-tenant access yields 404 Not Found to prevent resource enumeration.');
  addBullet('Server tests cover payroll calculations, rounding, and tenant boundaries.');
  addBullet('Payroll query endpoint (POST /api/ask) answers questions like "What is Ramesh\'s net salary for October?" exclusively via internal tool execution.');
  addBullet('High-polish mobile-first dashboard UI with dark/light theme switching, interactive charts (Recharts), and quick 1-click demo logins.');
  doc.addPage();

  addHeader('2. Architecture & Monorepo Directory Structure');
  addParagraph('The project follows a clean monorepo architecture separating the Node/Express backend from the React Vite frontend.');
  addCodeBlock(
`Employee_payroll_system/
├── AGENTS.md                 # Complete assignment specification & rules
├── README.md                 # High-level repo documentation & guide
├── DESIGN.md                 # 2-page system design & security note
├── API.md                    # REST API specifications and contracts
├── PROGRESS.md               # Development memory, changelog & checklist
├── PROJECT_GUIDE.pdf         # Project guide
├── .gitignore                # Excludes .env, node_modules, build outputs
│
├── server/                   # Backend Express REST API
│   ├── .env.example          # Template for backend secrets
│   ├── package.json          # Dependencies (express, mongoose, bcrypt, jwt)
│   ├── src/
│   │   ├── config/db.js      # MongoDB Atlas connection lifecycle
│   │   ├── models/           # Mongoose schemas: Company, User, Attendance
│   │   ├── controllers/      # auth, company, employee, payroll, ask
│   │   ├── middleware/       # authenticate, authorizeRoles, errorHandler
│   │   ├── services/         # payrollQueryService (payroll query parser)
│   │   ├── utils/            # Pure payrollCalculator.js engine
│   │   └── scripts/seed.js   # Idempotent database seeder
│   └── tests/                # Jest test suites (unit + integration)
│
└── client/                   # Frontend React (Vite) Single-Page App
    ├── .env.example          # Template for client API URL
    ├── package.json          # React 18, Tailwind CSS, Lucide, Recharts
    ├── vite.config.js        # Vite bundler configuration & /api proxy
    └── src/
        ├── api/client.js     # Axios instance with auto-JWT & 401 redirect
        ├── context/          # AuthContext, ThemeContext, ToastContext
        ├── components/       # Reusable Button, Card, Modal, Input, Badge
        └── pages/            # Login, Dashboard, Employees, Payroll, AskAI`
  );
  doc.moveDown(1);

  addHeader('3. Getting Started: Installation, Seeding & Execution');
  addParagraph('Follow these commands to install, seed, test, and run the entire stack locally:');
  addCodeBlock(
`# 1. Install Backend Dependencies
cd server
npm install

# 2. Configure Environment Variables
# Copy server/.env.example to server/.env and verify MONGODB_URI & JWT_SECRET

# 3. Seed MongoDB Atlas Database
npm run seed

# 4. Run Automated Backend Test Suite (20 tests)
npm test

# 5. Start Backend Server (runs on http://localhost:5000)
npm run dev   # or: node src/server.js

# 6. Install & Launch Frontend (in a new terminal)
cd ../client
npm install
npm run dev   # runs on http://localhost:5173`
  );
  doc.addPage();

  addHeader('4. Demo Credentials & Step-by-Step Reviewer Tour');
  addParagraph('The seeder sets up two completely segregated organizations to verify isolation and role permissions. The login page provides 1-Click Quick Demo Login buttons for immediate evaluation.');

  addSubHeader('Seeded Company Accounts:');
  addBullet('Company A (Acme Textiles - 26 Working Days):');
  addBullet('   • Admin: admin@acme.com | Password: Password123!');
  addBullet('   • Employee 1: ramesh@acme.com | Password: Password123! (Ramesh Kumar, CTC ₹60,000)');
  addBullet('   • Employee 2: priya@acme.com | Password: Password123! (Priya Sharma, CTC ₹55,000)');
  addBullet('Company B (Bright Foods - 24 Working Days):');
  addBullet('   • Admin: admin@bright.com | Password: Password123!');
  addBullet('   • Employee 1: ramesh@bright.com | Password: Password123! (Ramesh Gupta, CTC ₹52,000)');

  addSubHeader('Step-by-Step Verification Script:');
  addBullet('1. Log in as Acme Admin (click Quick Demo button): Note dashboard analytics showing 26 working days for October, total net payroll, and salary distribution.');
  addBullet('2. Run Payroll: Go to "Run Payroll" (/payroll). Select Ramesh Kumar. Notice default attendance (22 Present, 2 Absent, 2 Half-day = 26 days). Click "Compute & Save Payroll". Observe exact ₹47,769.24 net salary breakdown.');
  addBullet('3. Verify Isolation: Log out and log in as Bright Admin (Company B). Notice only Bright Foods employees appear. Ramesh Gupta (₹52,000) is shown, with zero visibility of Acme Textiles data.');
  addBullet('4. Verify Role Restriction: Log in as Employee Ramesh Kumar (Company A). Notice the admin dashboard and sidebar links are gone; only "My Payslips" and "Ask AI" are accessible.');
  addBullet('5. Test Ask AI: In the Ask AI page, click the suggestion chip "What is Ramesh\'s net salary for October?". The assistant executes internal tenant tools and returns ₹47,769.24.');
  doc.addPage();

  addHeader('5. Pure Payroll Calculation Engine & Worked Example');
  addParagraph('The payroll engine is encapsulated inside a pure, deterministic function in server/src/utils/payrollCalculator.js. It has zero database dependencies, making it 100% unit-testable and mathematically deterministic.');

  addSubHeader('Mathematical Formulas:');
  addCodeBlock(
`1. Loss of Pay (LOP) Days:
   lopDays = absentDays + (0.5 * halfDays) + unmarkedDays

2. Daily Compensation Rate:
   perDaySalary = roundMoney(monthlySalary / workingDays)

3. Loss of Pay (LOP) Amount:
   lopAmount = roundMoney(perDaySalary * lopDays)

4. Earned Gross Monthly Salary:
   grossSalary = roundMoney(monthlySalary - lopAmount)

5. Statutory Tax & PF Deduction (default 10%):
   deduction = roundMoney(grossSalary * (deductionPercentage / 100))

6. Disbursable Net Salary:
   netSalary = roundMoney(grossSalary - deduction)`
  );

  addSubHeader('Worked Example (Ramesh Kumar - October 2026):');
  addBullet('Inputs: Monthly CTC = ₹60,000.00 | Working Days = 26 | Present = 22 | Absent = 2 | Half-days = 2');
  addBullet('1. lopDays = 2 + (0.5 * 2) = 3.0 days');
  addBullet('2. perDaySalary = 60,000 / 26 = ₹2,307.69 per day');
  addBullet('3. lopAmount = 2,307.69 * 3.0 = ₹6,923.07');
  addBullet('4. grossSalary = 60,000 - 6,923.07 = ₹53,076.93');
  addBullet('5. deduction = 53,076.93 * 0.10 = ₹5,307.69');
  addBullet('6. netSalary = 53,076.93 - 5,307.69 = ₹47,769.24');
  addParagraph('Unmarked Days Rule: Any working days not explicitly recorded as Present, Absent, or Half-day are treated as Absent, encouraging diligent HR attendance bookkeeping.');
  doc.addPage();

  addHeader('6. Multi-Tenancy Enforcement & RBAC Security');
  addParagraph('Security and tenant isolation form the core requirement of this system.');

  addSubHeader('1. Why companyId Exclusively Originates from the JWT:');
  addParagraph('In insecure multi-tenant systems, client requests often pass tenant identifiers via URLs (/api/:companyId/payroll) or request bodies. Malicious users can tamper with these values to access rival organizations (Insecure Direct Object Reference - IDOR). In our system:');
  addBullet('When a user logs in, their companyId is cryptographically signed inside a tamper-proof JWT token.');
  addBullet('The authenticate middleware verifies the signature and injects req.user.companyId.');
  addBullet('Any companyId sent in request parameters, query strings, or JSON bodies is strictly ignored.');

  addSubHeader('2. 404 Not Found vs 403 Forbidden Semantics:');
  addParagraph('If Company A admin attempts to fetch an employee or payroll record with an ID belonging to Company B:');
  addCodeBlock(
`// In server/src/controllers/employeeController.js
const employee = await User.findOne({
  _id: req.params.id,
  companyId: req.user.companyId, // Strictly scoped to caller's company!
});

if (!employee) {
  return res.status(404).json({ success: false, message: 'Employee not found.' });
}`
  );
  addParagraph('Returning 403 Forbidden would confirm to the attacker that the entity exists. Returning 404 Not Found completely obscures external records.');

  addSubHeader('3. Role-Based Access Control (RBAC):');
  addBullet('Admin: Full authority to create employees, view all staff, and run payroll for their company.');
  addBullet('Employee: Restricted exclusively to their own profile and payslips. Requesting another colleague\'s payroll within the same company returns 403 Forbidden.');
  doc.addPage();

  addHeader('7. File-by-File Code Tour & Request Flow');
  addParagraph('A typical transaction flows cleanly through well-defined layers without leaky abstractions:');
  addCodeBlock(
`[React Component] (e.g. RunPayroll.jsx)
       │
       ▼ axios POST /api/payroll/calculate (attaches Bearer JWT)
[server.js / app.js] (Helmet, CORS, Express JSON parser)
       │
       ▼
[middleware/auth.js] (Verifies JWT, extracts req.user & req.user.companyId)
       │
       ▼
[middleware/validator.js] (Validates presence, numeric ranges, ISO YYYY-MM)
       │
       ▼
[controllers/payrollController.js]
  • Queries Company for workingDaysConfig
  • Queries User with { _id, companyId: req.user.companyId }
  • Calls pure utils/payrollCalculator.js
  • Upserts Attendance with compound index { companyId, employeeId, month }
       │
       ▼
[Mongoose Models] (Validates schema types & compound uniqueness)
       │
       ▼
[MongoDB Atlas] (Persisted document snapshot)`
  );

  addSubHeader('Key Source Files & Responsibilities:');
  addBullet('server/src/utils/payrollCalculator.js: Pure mathematical calculation logic.');
  addBullet('server/src/middleware/auth.js: JWT verification and authorizeRoles guard.');
  addBullet('server/src/services/payrollQueryService.js: Internal company-scoped data queries used by REST API and Ask AI.');
  addBullet('client/src/context/AuthContext.jsx: Client session lifecycle and auto-redirect on 401.');
  addBullet('client/src/pages/RunPayroll.jsx: Attendance steppers, validation bar, and printable payslip.');
  doc.addPage();

  addHeader('8. Bonus Natural Language Query Assistant');
  addParagraph('The POST /api/ask endpoint allows users to ask plain-English questions like "What is Ramesh\'s net salary for October?".');
  addSubHeader('Query behavior:');
  addBullet('The query service never invents or estimates compensation figures.');
  addBullet('Questions are handled by the company-scoped payroll query service (findEmployeeByName, getPayrollRecord).');
  addBullet('All query executions inherit the caller\'s verified req.user context: Company A cannot query Company B, and an employee asking about peers is refused with an access violation.');
  addBullet('Ambiguous names (e.g., multiple employees sharing a first name) prompt the user for clarification.');

  doc.moveDown(1.5);
  addHeader('9. Assumptions, Known Limitations & Trade-offs');
  addSubHeader('Assumptions Made:');
  addBullet('Unmarked Days: Any working day in a month not marked Present, Absent, or Half-Day is counted as Absent (Loss of Pay).');
  addBullet('Month Resolution: Plain English month names ("October") resolve to the current calendar year (2026).');
  addBullet('Deductions: Modeled as a flat 10% statutory rate (representing PF and standard tax withholdings).');

  addSubHeader('Architectural Trade-offs:');
  addBullet('Shared Database, Shared Schema: Records include a companyId field, and queries are filtered by that company.');
  addBullet('Stateless Bearer JWT: Highly responsive for single-page applications. For banking-grade security, pairing with refresh token rotation in httpOnly cookies would be ideal.');
  doc.addPage();

  addHeader('10. Likely Interview Questions & Model Answers');

  addSubHeader('Q1: Why did you choose a shared-database tenant architecture instead of a separate database per company?');
  addParagraph('Answer: "For multiple companies, a shared database with a company identifier and compound indexes keeps queries scoped and migrations simple. A separate database per company is another option."');

  addSubHeader('Q2: How do you prevent Company A from seeing Company B\'s data via the LLM /ask endpoint?');
  addParagraph('Answer: "The query parser uses the authenticated user context. Its data access service scopes MongoDB queries to req.user.companyId, as the REST endpoints do."');

  addSubHeader('Q3: Why does requesting another company\'s employee ID return 404 instead of 403?');
  addParagraph('Answer: "To prevent enumeration attacks. If an attacker guesses an ID and receives 403 Forbidden, they know that the resource exists within the system. Returning 404 Not Found avoids revealing whether another company\'s record exists."');

  addSubHeader('Q4: What would you improve in this project with more time?');
  addParagraph('Answer: "I would add: 1) Daily biometric punch-clocking with geolocation, 2) Indian tax slab calculations (Section 115BAC), 3) Exporting payroll ledgers to CSV and automated bank transfer files (NEFT/RTGS), and 4) Refresh token rotation with Redis revocation."');

  doc.moveDown(1.5);
  addHeader('11. Deployment');
  addParagraph('The app can be deployed to cloud platforms:');
  addBullet('Backend (Render / Railway): Deploy the /server directory. Set environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL, PORT). Start command: node src/server.js.');
  addBullet('Frontend (Vercel / Netlify): Deploy the /client directory. Set VITE_API_URL to the production backend URL. Build command: npm run build, Output directory: dist.');
  addBullet('Database: Hosted on MongoDB Atlas with IP whitelisting restricted to production server IPs.');

  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.fillColor(MUTED).fontSize(8).font('Helvetica')
        .text(`MobiusEMS Payroll System — Project Guide | Candidate: Aditya Bhalerao`, 50, doc.page.height - 35)
        .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 110, doc.page.height - 35, { align: 'right' });
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

buildProjectGuidePdf()
  .then((out) => console.log(`[PDF] PROJECT_GUIDE.pdf generated successfully at: ${out}`))
  .catch((err) => console.error('[PDF Error]', err));
