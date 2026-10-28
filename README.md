# Employee Payroll System

An attendance and payroll app for multiple companies. Admins manage employees and run payroll. Employees can view their payslips.

## Features

- Company-scoped employee and payroll data
- Admin and employee roles
- Monthly payroll calculations from attendance
- Payroll questions through the `/api/ask` endpoint
- Responsive dashboard with light and dark themes

## Payroll rules

- Loss of Pay (LOP) days are absent days plus half of each half-day. Unmarked working days count as absent.
- Per-day salary is monthly salary divided by working days. Currency values are rounded to two decimal places during the calculation.
- The default deduction is 10% of earned gross pay.

## Tech stack

- Server: Node.js, Express, MongoDB, Mongoose
- Client: React, Vite, Tailwind CSS
- Tests: Jest, Supertest

## Setup

You need Node.js 18 or later and a MongoDB connection string.

```bash
git clone https://github.com/Adicoder24hr/employee_payroll_system.git
cd employee_payroll_system
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set `MONGODB_URI` and `JWT_SECRET`. Then seed the demo data and run the tests:

```bash
npm run seed
npm test
```

Start the server in one terminal:

```bash
cd server
npm run dev
```

Install and start the client in another terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Demo accounts

All seeded accounts use the password `Password123!`.

| Company | Role | Email |
|---|---|---|
| Acme Textiles | Admin | `admin@acme.com` |
| Acme Textiles | Employee | `ramesh@acme.com` |
| Bright Foods | Admin | `admin@bright.com` |
| Bright Foods | Employee | `ramesh@bright.com` |

The login page also has demo login buttons.

## Project docs

- [API.md](API.md): API routes and response examples
- [DESIGN.md](DESIGN.md): Data model, security, and payroll details
