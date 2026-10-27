# Enterprise Multi-Tenant Attendance-to-Payroll System

> **Take-Home Assessment for Full-Stack Developer Role**  
> **Company:** Mobius Bloom Ventures Pvt. Ltd. (MobiusEMS / Whalexy)  
> **Candidate:** Aditya Bhalerao  
> **Status:** Full-Stack Production Implementation (Node.js + React + MongoDB)

---

## 🌟 Overview & Core Highlights

This project implements a multi-tenant attendance-to-payroll management platform engineered with an emphasis on **strict multi-tenancy isolation**, **role-based access control (RBAC)**, **deterministic payroll calculation**, and a **mobile-first, responsive dashboard UI**.

### Key Capabilities
1. **Multi-Tenancy Isolation:** Strict tenant boundaries. Company A can never view or manipulate Company B's data under any condition. Requests for resources from other tenants yield `404 Not Found` to prevent entity enumeration.
2. **Deterministic Pure Payroll Engine:** Encapsulated financial calculation logic computing Loss-Of-Pay (LOP), gross earnings, statutory deductions, and net payouts with complete test coverage.
3. **Role-Based Access Control (RBAC):**
   - **Admin:** Manages company employees, configures monthly working days, executes payroll runs, and views aggregate reports.
   - **Employee:** Restricted strictly to self-service views (personal profile, personal payslips).
4. **Natural-Language Query Interface (Bonus AI Endpoint):** An AI query assistant powered by LLM tool calling. It answers plain-English payroll queries (e.g. *"What is Ramesh's net salary for October?"*) strictly by executing company-scoped internal queries, preventing hallucinations.
5. **Modern Mobile-First Design:** Crafted with React, Vite, and Tailwind CSS. Features full Dark/Light theme switching, interactive charts (Recharts), micro-animations, skeleton loaders, and quick 1-click demo login buttons.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js (v20+), Express.js | High-performance REST API |
| **Database** | MongoDB Atlas, Mongoose ODM | Multi-tenant document database with compound uniqueness |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Cryptographic stateless session & tenant identity |
| **Security** | Helmet, CORS, Express-Rate-Limit, Express-Validator | Defense-in-depth API hardening |
| **Testing** | Jest, Supertest | Unit & tenant-isolation testing |
| **Frontend** | React 18, Vite | Mobile-first single-page application |
| **Styling** | Tailwind CSS, Lucide React Icons | Modern SaaS design system with dark/light themes |
| **Visualizations**| Recharts | Interactive net salary distribution & analytics |
| **AI Integration**| Google Gemini / OpenAI Tool Calling | Grounded natural language data retrieval |

---

## 📁 Repository Structure

```
Employee_payroll_system/
├── AGENTS.md               # Assignment brief & requirements
├── README.md               # Comprehensive project documentation
├── DESIGN.md               # In-depth architectural & security design note
├── API.md                  # REST API contract & endpoint specifications
├── PROGRESS.md             # Development status, checklist & decision log
├── .gitignore              # Git ignore configuration
│
├── server/                 # Express.js REST API Backend
│   ├── .env.example        # Environment variable template for server
│   ├── package.json        # Backend dependencies & test scripts
│   ├── server.js           # Server entry point & Express application setup
│   ├── src/
│   │   ├── config/         # Database connection & environment configuration
│   │   ├── models/         # Mongoose models: Company, User, Attendance
│   │   ├── controllers/    # Request handlers: auth, company, employee, payroll, ask
│   │   ├── routes/         # Express routers with rate-limiters & validators
│   │   ├── middleware/     # Auth, RBAC, tenant context & central error handler
│   │   ├── services/       # Business logic & LLM tool-calling execution
│   │   └── utils/          # Pure payroll calculator & helpers
│   ├── tests/              # Jest unit & tenant isolation integration tests
│   └── scripts/            # Database seeder (Company A, Company B, demo accounts)
│
└── client/                 # React (Vite) Single-Page Application
    ├── .env.example        # Environment variable template for client
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite build configuration
    ├── tailwind.config.js  # Tailwind styling & dark mode configuration
    ├── src/
    │   ├── api/            # Axios HTTP client with auto-JWT & 401 handling
    │   ├── context/        # AuthContext & ThemeContext (Dark/Light mode)
    │   ├── components/     # UI library (Button, Card, Input, Modal, Toast, etc.)
    │   ├── pages/          # Login, Dashboard, Employees, RunPayroll, Settings, Payslips, AskAI
    │   └── utils/          # Currency formatters & date helpers
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **MongoDB Atlas:** Free cluster connection URI

### 2. Installation
Clone the repository and install dependencies in both `server` and `client`:

```bash
# Clone the repository
git clone <repo-url>
cd Employee_payroll_system

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend (`server/.env`):
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/attendance_payroll?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
NODE_ENV=development
CLIENT_URL=http://localhost:5173
LLM_API_KEY=optional_gemini_or_openai_api_key
```

#### Frontend (`client/.env`):
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Seeding
Populate the database with demo companies, administrators, employees, and historical attendance records:

```bash
cd server
npm run seed
```

### 5. Running the Application

```bash
# Terminal 1: Launch Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Launch Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

### 6. Running Backend Automated Tests
Execute unit and tenant-isolation integration tests:

```bash
cd server
npm test
```

---

## 🔑 Demo Login Credentials

The seed script creates two completely segregated companies to demonstrate tenant isolation:

### Company A: Acme Textiles (26 Working Days)
| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Acme Admin | `admin@acme.com` | `Password123!` |
| **Employee** | Ramesh Kumar | `ramesh@acme.com` | `Password123!` |
| **Employee** | Priya Sharma | `priya@acme.com` | `Password123!` |
| **Employee** | Amit Patel | `amit@acme.com` | `Password123!` |

### Company B: Bright Foods (24 Working Days)
| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Bright Admin | `admin@bright.com` | `Password123!` |
| **Employee** | Ramesh Gupta | `ramesh@bright.com` | `Password123!` |
| **Employee** | Neha Verma | `neha@bright.com` | `Password123!` |

> 💡 **Tip:** The login screen provides **1-Click Quick Demo Login** buttons for instant access without manual typing.

---

## 🔒 Security Architecture Highlights

1. **Token-Originated Tenant Scoping:** The `companyId` is embedded in the signed JWT. No user can forge another company's identifier in the request URL or body.
2. **Existence Privacy:** Querying a resource belonging to another tenant yields `404 Not Found`, denying attackers knowledge of external entity IDs.
3. **Role Segregation:** Employees attempting to access admin endpoints receive `403 Forbidden`, and employees attempting to view peers' compensation receive `403 Forbidden`.
4. **LLM Tool Isolation:** The natural-language endpoint executes tools inside the authenticated caller's tenant boundary.

---

## 📸 Screenshots

*(Interactive UI previews: Login with 1-click presets, Admin Payroll Dashboard, Run Payroll with live calculation breakdown, Employee My Payslips view, Dark Mode, and Ask AI interface.)*
