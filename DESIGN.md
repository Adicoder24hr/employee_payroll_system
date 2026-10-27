# System Design Note: Multi-Tenant Attendance-to-Payroll System

**Author:** Aditya Bhalerao  
**Role:** Full-Stack Developer Take-Home Assignment (Mobius Bloom Ventures / MobiusEMS)  

---

## 1. Executive Summary & Architecture Overview

The system is a production-grade, multi-tenant Attendance-to-Payroll web application built to service multiple independent business organizations. It guarantees absolute tenant data isolation, strict role-based access control (RBAC), deterministic payroll calculation, and a conversational AI query interface backed by grounded function calling.

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
Represents an enterprise tenant.
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
  - **Reason:** Returning `403 Forbidden` would confirm to the attacker that the entity exists in the system (existence leakage). Returning `404` maintains complete opacity.

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

## 5. Bonus: Natural-Language Endpoint Safety & Tool Calling

The `/api/ask` endpoint enables conversational payroll queries (e.g. *"What is Ramesh's net salary for October?"*) via LLM Tool / Function Calling.

### Security & Anti-Hallucination Guarantees
1. **Zero Hallucination:** The LLM's system prompt strictly prohibits inferring or estimating compensation figures. All financial data must be retrieved from executing tool calls against our verified API services.
2. **Identity Propagation:** When the LLM decides to invoke a tool (such as `find_employee_by_name` or `get_payroll`), the tool execution inherits the authenticated user's `req.user` context.
3. **No Cross-Tenant Leakage:** The tools invoke internal services that automatically filter by `req.user.companyId`. The LLM cannot provide or modify `companyId`.
4. **Role Enforcement:** If an employee asks *"What is John's salary?"*, the tool layer rejects the query with an access violation, which the LLM returns as an authorized rejection.
5. **Ambiguity Resolution:** If multiple employees share a name (or a first name) within the company, the tool returns the list of matching candidates and asks the user to clarify by email or designation.

---

## 6. Assumptions & Design Decisions
1. **Unmarked Days:** If the sum of `presentDays + absentDays + halfDays` is less than `workingDays`, remaining unrecorded days are treated as absent, encouraging full accountability.
2. **Month Representation:** Formatted as standard ISO year-month string `"YYYY-MM"`. When a user types "October", the system resolves it to the most relevant year (current year).
3. **Deductions:** Modeled as a configurable percentage (default 10%) representing statutory withholdings (PF/income tax).

---

## 7. Trade-offs & Future Extensions

| Decision / Trade-off | Rationale | What I'd Do With More Time |
|---|---|---|
| **Shared Database, Shared Schema (Tenant Column)** | Optimal for cost-efficiency, rapid migrations, and moderate tenant counts. | Separate database per enterprise tier or PostgreSQL Row-Level Security (RLS) for hard kernel isolation. |
| **Flat Deduction Rate** | Simple and clean for a take-home assessment. | Comprehensive tax slabs (e.g. Indian New Tax Regime 115BAC), Employee PF (12%), Professional Tax, and custom allowances (HRA, Special). |
| **Summary-based Monthly Attendance** | Simple UI steppers; immediate calculation without needing 30 individual date pickers. | Daily punch clocking with biometric/geo-fence integration, shift management, and leave approval workflows. |
| **Stateless Bearer JWT** | Highly performant, standard for modern SPAs. | Refresh token rotation in httpOnly secure cookies + Redis-backed token revocation list. |
