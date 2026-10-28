# System Design Note: Attendance-to-Payroll System

**Author:** Aditya Bhalerao  
**Role:** Full-Stack Developer Take-Home Assignment (Mobius Bloom Ventures / MobiusEMS)  

---

## 1. Executive Summary & Architecture Overview

The system is a multi-company attendance and payroll web app. It scopes records to the signed-in user's company, uses role-based access, calculates payroll, and supports payroll questions through a company-scoped query parser.

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 React Client (Vite + Tailwind)              │
│       Mobile-First UI, Dark/Light Mode, Recharts, Lucide    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                  Express.js REST API Server                 │
│  ┌───────────────────────┬───────────────────────────────┐  │
│  │ Security Middlewares  │  Rate Limiting, Helmet, CORS   │  │
│  │ Auth & RBAC           │  JWT Verification, Role Guard  │  │
│  │ Tenant Context Scope  │  Injects verified companyId    │  │
│  │ Controllers & Logic   │  Pure Payroll Engine, Validation│ │
│  │ Bonus AI Service      │  LLM Function Calling Sandbox  │  │
│  └───────────────────────┴───────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM (Company-Scoped Queries)
┌──────────────────────────────▼──────────────────────────────┐
│                    MongoDB Atlas Cluster                    │
│    Collections: companies, users, attendances (Compound Index)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Models & Schema Design

### 2.1 Company (`companies`)
Represents a company.
- `_id`: ObjectId
- `name`: String (e.g. "Acme Textiles")
- `code`: String (unique identifier/slug, e.g. "ACME")
- `defaultWorkingDays`: Number (default: 26)
- `defaultDeductionPercentage`: Number (default: 10%)
- `workingDaysConfig`: Map of `YYYY-MM` to Number (e.g. `{ "2026-10": 26, "2026-11": 25 }`)
- `createdAt`, `updatedAt`: Timestamps

### 2.2 User / Employee (`users`)
Represents administrative operators and employees.
- `_id`: ObjectId
- `companyId`: ObjectId (required, indexed, references `Company`)
- `name`: String
- `email`: String (lowercase, trimmed; indexed compound with `companyId` for uniqueness per company)
- `passwordHash`: String (bcrypt hashed; excluded from JSON projections)
- `role`: Enum `["admin", "employee"]`
- `designation`: String (e.g. "Senior Engineer")
- `monthlySalary`: Number (base monthly gross CTC)
- `isActive`: Boolean (default: true)
- `createdAt`, `updatedAt`: Timestamps

### 2.3 Attendance & Payroll Record (`attendances`)
Stores the monthly attendance tally and computed payroll snapshot.
- `_id`: ObjectId
- `companyId`: ObjectId (required, indexed)
- `employeeId`: ObjectId (required, indexed, references `User`)
- `month`: String in format `"YYYY-MM"` (e.g. `"2026-10"`)
- `workingDays`: Number (working days resolved for that month)
- `presentDays`: Number
- `absentDays`: Number
- `halfDays`: Number
- `lopDays`: Number (Loss of Pay days)
- `perDaySalary`: Number
- `lopAmount`: Number
- `grossSalary`: Number (Earned gross after LOP deduction)
- `deductionRate`: Number (Percentage, e.g. 10)
- `deduction`: Number (Amount deducted)
- `netSalary`: Number (Disbursable salary)
- `calculatedAt`: Date
- `calculatedBy`: ObjectId (references `User` who triggered payroll)

**Compound Index:** `{ companyId: 1, employeeId: 1, month: 1 }` with `{ unique: true }`.

---

## 3. Multi-Tenancy Enforcement & Security

### Why `companyId` Originates Strictly from the Token
A critical vulnerability in multi-tenant architectures is "Parameter Tampering" or "IDOR" (Insecure Direct Object Reference), where malicious actors modify the `companyId` in request query strings, headers, or JSON payloads to access another tenant's records.

To prevent this:
1. When a user authenticates (`/api/auth/login`), their `companyId` and `role` are embedded inside a cryptographically signed JWT.
2. The `authenticate` middleware verifies the JWT signature and attaches the verified claims to `req.user`.
3. Every downstream controller and data access service exclusively sources `companyId` from `req.user.companyId`.
4. Any `companyId` sent by the client in body, params, or query is systematically ignored.

### Tenant Isolation HTTP Semantics (404 vs 403)
- If Company A's admin attempts to fetch an employee or payroll record with an ID that belongs to Company B:
  - The query is executed with: `User.findOne({ _id: targetId, companyId: req.user.companyId })`.
  - Because Company B's entity has a different `companyId`, the database returns `null`.
  - The API responds with **`404 Not Found`**.
  - **Reason:** Returning `403 Forbidden` would confirm that the entity exists. Returning `404` avoids revealing that information.

### Role-Based Access Control (RBAC)
- **Admin:** Permitted to query all employees within their own company, create employees, configure company working days, and calculate/view monthly payroll for anyone in their company.
- **Employee:** Permitted only to view their own profile and their own historical payslips (`/api/payroll/me` or `/api/payroll/:employeeId/:month` where `employeeId === req.user._id`). Requesting another employee's records within the same company returns **`403 Forbidden`**.

---

## 4. Payroll Calculation Engine

The payroll calculation logic is encapsulated in a pure, deterministic function (`utils/payrollCalculator.js`) free of database side effects.

### Formula
1. **Loss of Pay (LOP) Days:**
   $$\text{lopDays} = \text{absentDays} + (0.5 \times \text{halfDays})$$
2. **Per-Day Salary Rate:**
   $$\text{perDaySalary} = \frac{\text{monthlySalary}}{\text{workingDays}}$$
3. **Loss of Pay (LOP) Amount:**
   $$\text{lopAmount} = \text{round}(\text{perDaySalary} \times \text{lopDays})$$
4. **Earned Gross Salary:**
   $$\text{grossSalary} = \text{monthlySalary} - \text{lopAmount}$$
5. **Deduction (Statutory Tax / PF):**
   $$\text{deduction} = \text{round}\left(\text{grossSalary} \times \frac{\text{deductionPercentage}}{100}\right)$$
6. **Disbursable Net Salary:**
   $$\text{netSalary} = \text{grossSalary} - \text{deduction}$$

All currency values are rounded to 2 decimal places using deterministic financial rounding.

### Worked Example
- **Employee:** Ramesh
- **Monthly CTC:** ₹60,000.00
- **Month:** October 2026 (Working days = 26)
- **Attendance:** Present = 22, Absent = 2, Half-days = 2 (Total accounted = 26)
- **Deduction Rate:** 10%

**Calculation:**
1. $\text{lopDays} = 2 + (0.5 \times 2) = 3.0\text{ days}$
2. $\text{perDaySalary} = \frac{60000}{26} \approx 2307.6923$
3. $\text{lopAmount} = 2307.6923 \times 3 = ₹6,923.08$
4. $\text{grossSalary} = 60000 - 6923.08 = ₹53,076.92$
5. $\text{deduction} = 53076.92 \times 0.10 = ₹5,307.69$
6. $\text{netSalary} = 53076.92 - 5307.69 = ₹47,769.23$

---

## 5. Payroll Query Endpoint

The `/api/ask` endpoint accepts payroll questions such as *"What is Ramesh's net salary for October?"*. The server parses the question and reads matching company-scoped payroll records.

### Query behavior
1. Payroll figures come from company-scoped services; the parser does not estimate them.
2. Services use the authenticated user's `req.user` context and company ID.
3. Employees can only query their own payroll records.
4. If multiple employees match a name, the response lists candidates for clarification.

---

## 6. Assumptions & Design Decisions
1. **Unmarked Days:** If the sum of `presentDays + absentDays + halfDays` is less than `workingDays`, remaining unrecorded days are treated as absent, encouraging full accountability.
2. **Month Representation:** Formatted as standard ISO year-month string `"YYYY-MM"`. When a user types "October", the system resolves it to the most relevant year (current year).
3. **Deductions:** Modeled as a configurable percentage (default 10%) representing statutory withholdings (PF/income tax).

---

## 7. Trade-offs & Future Extensions

| Decision / Trade-off | Rationale | What I'd Do With More Time |
|---|---|---|
| **Shared Database, Shared Schema (Tenant Column)** | Keeps tenant data in one database with a company identifier. | A separate database per company or PostgreSQL row-level security for stronger database-level isolation. |
| **Flat Deduction Rate** | Uses a single configurable percentage. | Add Indian tax slabs (e.g. New Tax Regime 115BAC), Employee PF (12%), Professional Tax, and custom allowances (HRA, Special). |
| **Summary-based Monthly Attendance** | Simple UI steppers; immediate calculation without needing 30 individual date pickers. | Daily punch clocking with biometric/geo-fence integration, shift management, and leave approval workflows. |
| **Stateless Bearer JWT** | Works with the client's bearer-token requests. | Refresh token rotation in httpOnly secure cookies + Redis-backed token revocation list. |
