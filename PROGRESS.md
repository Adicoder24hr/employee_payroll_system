# Project Progress & Memory

## Status Overview
- **Project Name:** Multi-Tenant Attendance-to-Payroll System (MobiusEMS / Whalexy Take-Home)
- **Candidate:** Aditya Bhalerao
- **Current Phase:** Step 1 Completed (Repository init & Memory Docs). Moving to Step 2 (Backend implementation & tests).

---

## Master Checklist

- [x] **Step 1: Setup & Project Memory Files**
  - [x] Git repository initialization
  - [x] Root `.gitignore` (ignoring `.env`, `node_modules`, build artifacts)
  - [x] `server/.env.example` & `client/.env.example`
  - [x] `README.md`
  - [x] `DESIGN.md`
  - [x] `API.md`
  - [x] `PROGRESS.md`

- [x] **Step 2: Backend Implementation & Tests**
  - [x] Initialize `/server` with `package.json` and dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, helmet, dotenv, express-rate-limit, express-validator, etc.)
  - [x] Implement Mongoose models (`Company`, `User`, `Attendance`)
  - [x] Implement pure payroll calculation function in `utils/payrollCalculator.js`
  - [x] Implement pure payroll calculation unit tests (`tests/payrollCalculator.test.js` - 11/11 passing)
  - [x] Implement Auth middleware (`authenticate`, `authorizeRoles`), tenant-scoping helpers, validation rules, central error handler
  - [x] Implement controllers & routes (`/api/auth`, `/api/companies`, `/api/employees`, `/api/payroll`, `/api/ask`)
  - [x] Write integration / isolation tests (`tests/tenantIsolation.test.js` - 9/9 passing)
  - [x] Write database seed script (`server/scripts/seed.js`)

- [x] **Step 3: Database Connection & Verification**
  - [x] Guide user through MongoDB Atlas configuration step-by-step
  - [x] Securely store `MONGODB_URI` and generated `JWT_SECRET` in `server/.env` (verified excluded from git)
  - [x] Run seed script and verify database population (Acme Textiles & Bright Foods seeded with 3 months history)
  - [x] Run tests against database / in-memory instance (20/20 tests passing)

- [x] **Step 4: Frontend Implementation**
  - [x] Initialize React Vite app with Tailwind CSS and Lucide icons in `/client`
  - [x] Implement theme system (dark/light toggle persisted in localStorage)
  - [x] Setup Axios client, AuthContext, token handling, auto logout on 401
  - [x] Build reusable UI components (Button, Card, Input, Modal, Badge, Skeleton, Stepper)
  - [x] Implement Pages:
    - [x] Login page (with 1-click Quick Demo login buttons for Acme Admin, Bright Admin, Ramesh)
    - [x] Admin Dashboard (Metrics cards, Net Salary charts via Recharts, recent payroll list)
    - [x] Employees management (Search, filter, add employee modal)
    - [x] Run Payroll (Month selector, employee selector, live attendance validation, calculation breakdown card, payslip preview)
    - [x] Company Settings (Working days config per month)
    - [x] My Payslips (Employee view: personal history and payslip modal/view)
    - [x] 404 & Protected Route Guards

- [x] **Step 5: Bonus Natural-Language Endpoint (POST /api/ask)**
  - [x] Implement company-scoped query service (`find_employee_by_name`, `get_payroll`) respecting tenant isolation & caller role
  - [x] Build clean chat UI in Ask AI page with suggestion chips and structured data preview
  - [x] Verified answer extraction: "What is Ramesh's net salary for October?" -> ₹47,769.24

- [ ] **Step 6: Polish, Guide & Final Deliverables**
  - [ ] Generate comprehensive `PROJECT_GUIDE.pdf` in project root
  - [ ] Final interview walkthrough and project tour
  - [ ] Final code cleanup audit (ask user confirmation before deleting temporary files)
  - [ ] GitHub remote connection and push

---

## Changelog
- **2026-10-27:**
  - Initialized Git repository and verified Node v20.19.5 & npm 10.8.2.
  - Created root `.gitignore`, `server/.env.example`, `client/.env.example`.
  - Created initial documentation files: `README.md`, `DESIGN.md`, `API.md`, and `PROGRESS.md`.

---

## Architectural Decisions & Assumptions
1. **Multi-Tenancy via Verified JWT:** The `companyId` is strictly extracted from `req.user.companyId` after JWT signature verification. It is never accepted from request query, headers, or body.
2. **Tenant Isolation HTTP Semantics:** When an admin queries an entity belonging to another company, the API returns `404 Not Found` rather than `403 Forbidden` to prevent leaking the existence of other tenants' resources.
3. **Role-Based Access Control (RBAC):** `admin` has full access to their company's employees and payroll runs. `employee` can only view their own profile and their own payroll records. If an employee queries another employee's records within the same company, it returns `403 Forbidden`.
4. **Attendance Calculation Choice:** Working days are configured per company per month (defaulting to 26 if unspecified). Any working day not explicitly marked as present or half-day is counted as absent.
5. **Deduction Scheme:** Default 10% statutory deduction (PF/tax) calculated on the earned gross salary.
