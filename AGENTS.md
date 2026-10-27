You are building a complete full-stack project end to end, autonomously. Read this whole brief before writing any code.

=====================================================
1. PROJECT CONTEXT
=====================================================
This is a Round 2 take-home assignment for a Full-Stack Developer role at Mobius Bloom Ventures Pvt. Ltd. (product: MobiusEMS / Whalexy). The original brief asks for a small multi-tenant attendance-to-payroll API. The recruiter also asked for a full-stack app with a responsive, mobile-first UI.

Original requirements (all must be met):
1. Two companies, each with its own employees and a monthly working-days configuration.
2. An endpoint that takes one month's attendance (present / absent / half-day) for an employee and returns: loss-of-pay (LOP) days, gross salary, a simple deduction, and net salary.
3. Role-based access: an Admin can run payroll for anyone in their company; an Employee can only see their own data.
4. Company A's data must NEVER be visible to Company B.
5. Node.js backend, a short design note, and 3-4 test cases for the payroll calculations.
Optional bonus: an endpoint that answers a plain-English question such as "What is Ramesh's net salary for October?" using an LLM that calls my own API (tool/function calling) to retrieve the real value. The LLM must never invent numbers.

Candidate: Aditya Bhalerao. This will be reviewed by engineers, so correctness, clarity and polish matter more than feature count.

=====================================================
2. TECH STACK (fixed, do not substitute)
=====================================================
- Backend: Node.js + Express.js
- Database: MongoDB (Atlas) with Mongoose
- Frontend: React (Vite) + Tailwind CSS, React Router
- Auth: JWT (httpOnly cookie or Bearer token, pick the simpler one and document it) + bcrypt for password hashing
- Tests: Jest (or Node's built-in test runner) for backend
- Structure: monorepo with /server and /client folders, a root README.md

=====================================================
3. WORKING STYLE (very important)
=====================================================
- Work fully autonomously. Do NOT ask for permission for routine things: creating files and folders, installing npm packages, running dev servers, running tests, fixing errors, refactoring. Make sensible decisions yourself, and record any assumption in the docs.
- Only stop and ask me in these cases: (a) the MongoDB Atlas connection string, (b) the optional LLM API key, (c) something truly blocked that you cannot resolve yourself.
- Write code that looks human-written: simple, readable, beginner-friendly. Use plain async/await, small functions, clear variable names, straightforward if/else logic. Avoid clever one-liners, heavy abstractions, deep generics, over-engineering, unnecessary design patterns, and cryptic reduce chains. Add short, natural comments only where the "why" is not obvious. No comment spam, no AI-sounding boilerplate comments.
- Keep the folder structure conventional: routes, controllers, models, middleware, utils/services on the server; pages, components, hooks, api on the client.
- Run the app and the tests yourself, and fix what breaks before telling me it's done.

=====================================================
4. PROJECT MEMORY FILES (keep these updated, and READ them)
=====================================================
Create these at the start and treat them as the source of truth:
- README.md: overview, tech stack, setup steps, env variables, how to run server/client/tests/seed, demo credentials, folder structure, screenshots section.
- DESIGN.md: the short design note the assignment asks for (see section 9).
- API.md: every endpoint with method, path, auth/role needed, request body, sample response, error cases.
- PROGRESS.md: a running checklist of what is done / in progress / pending, plus a short changelog and a list of assumptions and decisions.

Rules:
- BEFORE making any change, re-read README.md, DESIGN.md, API.md and PROGRESS.md so you stay consistent with the project's current state.
- AFTER every meaningful change (new endpoint, model change, new page, config change), update the relevant files immediately. Never let the docs drift from the code.
- Also create: .gitignore (must include .env, node_modules), server/.env.example, client/.env.example.

=====================================================
5. DATABASE SETUP: GUIDE ME THROUGH MONGODB ATLAS
=====================================================
Do not assume I have a database ready. When you reach the database step, STOP and walk me through it, one short step at a time, in simple language:
1. Log in to MongoDB Atlas and open my existing cluster.
2. Create a new database named `attendance_payroll` (with a first collection named `companies`) via Browse Collections > Create Database.
3. Go to Database Access and create a dedicated database user with a username and password (readWrite on that database only). Tell me to avoid special characters in the password, or to URL-encode them.
4. Go to Network Access and allow my current IP (or 0.0.0.0/0 for development only, and warn me it's for dev only).
5. Go to Connect > Drivers and copy the connection string (mongodb+srv://...).
6. Tell me to paste the full URI here with the username, password and database name filled in, in this form:
   mongodb+srv://<username>:<password>@<cluster-url>/attendance_payroll?retryWrites=true&w=majority
Then:
- Save it only in server/.env as MONGODB_URI. Never hardcode it, never commit it, never print it in logs or docs.
- Test the connection, and if it fails, diagnose it (wrong password, IP not whitelisted, bad URI encoding) and tell me exactly what to fix.
- Also generate a strong JWT_SECRET yourself and put it in .env.
Build everything else first, so I only get interrupted once for the URI.

=====================================================
6. BACKEND REQUIREMENTS
=====================================================
Data models (Mongoose):
- Company: name, code/slug, workingDaysConfig. Working days can be set per month (e.g. a map of "YYYY-MM": days) with a sensible default (e.g. 26) used when a month has no override.
- User/Employee: companyId (required, indexed), name, email (unique per company), passwordHash, role ("admin" | "employee"), monthlySalary (gross monthly salary), designation, isActive.
- Attendance (payroll record): companyId, employeeId, month ("YYYY-MM"), daily records or summary counts (present, absent, halfDay), plus the computed payroll result stored with it. One record per employee per month (unique index).

Payroll calculation (keep it simple, put it in ONE pure, easily testable function in utils/payrollCalculator.js):
- workingDays = company working days for that month
- lopDays = absentDays + (0.5 x halfDays)
- perDaySalary = monthlySalary / workingDays
- lopAmount = perDaySalary x lopDays
- grossSalary = monthlySalary - lopAmount (earned gross for the month)
- deduction = a simple flat percentage of grossSalary (default 10%, configurable per company, labelled as a PF/tax style deduction)
- netSalary = grossSalary - deduction
- Round money to 2 decimals.
- Validate input: counts cannot be negative, present + absent + halfDay cannot exceed workingDays, month format must be valid. Unmarked days count as absent; document this choice. Return clear 400 errors.
Show the formula and a worked example in DESIGN.md.

Endpoints (prefix /api):
- POST /auth/login: email + password (+ company code, or make emails unique globally; pick one, document it). Returns the token and user.
- GET /auth/me
- GET /employees: admin only, lists employees of the admin's own company.
- POST /employees: admin only, creates an employee in their own company.
- GET /companies/me: the current company and its working-days config. PUT /companies/me/working-days: admin only.
- POST /payroll/calculate: takes { employeeId, month, attendance } and returns lopDays, grossSalary, deduction, netSalary (plus the inputs and workingDays). Admin can run it for any employee in their company, and it saves/upserts the record.
- GET /payroll/:employeeId/:month: fetch a saved result. An employee can only fetch their own, and an admin can fetch anyone in their company.
- GET /payroll/me: the employee's own payroll history.
- BONUS: POST /ask: { question } returns { answer, data }. See section 8.

Security (the most important part of this assignment):
- companyId must ALWAYS come from the verified JWT/req.user, never from the request body, query or URL.
- Every database query that touches tenant data must filter by companyId. Prefer one small helper or middleware so this is hard to forget.
- Requesting another company's employee or record must return 404 (not 403), so existence is not leaked.
- An employee requesting someone else's data in their own company gets 403.
- Middleware: authenticate (verify JWT) and authorizeRoles(...roles). Never return passwordHash. Add helmet, cors with a configured origin, express-rate-limit on login, and input validation (express-validator or zod, whichever is simpler). Use a central error-handling middleware with clean JSON errors.

Seed script (npm run seed on the server):
- Company A (e.g. "Acme Textiles", 26 working days) and Company B (e.g. "Bright Foods", 24 working days).
- Each company: 1 admin and 4-5 employees. Company A must include an employee named "Ramesh" so the bonus question works. Include a few employees with the same first name across companies to prove isolation.
- Sample attendance for the last 2-3 months.
- Print demo login credentials in the terminal and put them in README.md. Make the seed safe to re-run.

=====================================================
7. FRONTEND REQUIREMENTS (the UI must be genuinely impressive)
=====================================================
Design goals: modern, sleek, premium SaaS feel. MOBILE-FIRST, then scale up to tablet and desktop. Think Linear / Stripe dashboard / Vercel quality, not a generic Bootstrap look.

Visual direction:
- Clean layout with generous whitespace, a refined colour palette (a confident primary such as indigo/violet or emerald, with neutral slate greys), soft shadows, rounded-xl cards, subtle gradients on key surfaces, and a consistent spacing and type scale (use a modern font like Inter via Google Fonts).
- Full dark mode and light mode with a toggle (persisted).
- Smooth micro-interactions: hover and focus states, button press feedback, page and card fade/slide transitions, skeleton loaders (not bare spinners), toast notifications for success and error.
- Nice empty states and friendly error states, plus an icon set (lucide-react).
- Accessible: proper labels, focus rings, good contrast, keyboard friendly, semantic HTML.

Responsive behaviour:
- Mobile: bottom tab bar or slide-in drawer navigation, single-column cards, large touch targets (44px+), and tables turned into stacked cards.
- Desktop: collapsible sidebar, top bar with the company name and user menu, multi-column dashboard grids.
- Test it at 360px, 768px and 1280px widths.

Pages:
1. Login: polished split layout on desktop (brand panel + form), compact on mobile. Include "quick demo login" buttons for the seeded Company A admin, Company B admin and an employee, so a reviewer can try it in seconds.
2. Admin Dashboard: summary cards (employees, working days this month, total payroll for the month, total LOP days), a simple chart of net salary by employee or by month (use recharts), and a recent payroll runs list.
3. Employees (admin): searchable list, add-employee form (modal or drawer), employee details.
4. Run Payroll (admin): choose an employee and month, enter present / absent / half-day through friendly steppers or inputs, with live validation against the working days, then a "Calculate" action. Show a beautiful result card/breakdown: gross, LOP days, LOP amount, deduction, net salary (with a clear visual breakdown such as a bar or donut). Optionally a printable payslip view.
5. Company Settings (admin): set working days per month.
6. My Payslips (employee): their own history and a detailed payslip view. The employee must see NO admin pages or menus.
7. Ask AI (bonus): a clean chat-style interface where the user types questions like "What is Ramesh's net salary for October?", with suggestion chips, typing indicator, and answers that show the retrieved data in a small card.
8. A tidy 404 page, plus route guards (redirect unauthenticated users to login, block wrong-role access to pages).

Frontend code rules: functional components + hooks, a small api/ folder with an axios instance that attaches the token and handles 401 by logging out, a simple AuthContext, reusable components (Button, Card, Input, Modal, Badge, Skeleton, Toast). Keep state management simple: no Redux.

=====================================================
8. BONUS: NATURAL-LANGUAGE ENDPOINT (POST /api/ask)
=====================================================
- Use an LLM with TOOL/FUNCTION CALLING. The model must call the app's own data functions (e.g. find_employee_by_name, get_payroll(employeeId, month)) and answer ONLY from the returned data. It must never guess numbers.
- Tool execution must run with the logged-in user's identity: the tools reuse the same company-scoped, role-checked service functions as the REST API. So an Employee asking about someone else gets refused, and Company A can never retrieve Company B's data through the LLM either. The LLM must never be given a companyId to choose from.
- Handle: month names in plain English ("October" resolves to the current or most relevant year, and document how), unknown employee, ambiguous names (ask to clarify), and no payroll saved for that month.
- Wire the provider behind one small service file so it's swappable. Prefer Google Gemini (free tier friendly) with function calling, or OpenAI, whichever is simpler. Ask me which key I have when you reach this step and store it in server/.env as LLM_API_KEY. If I don't have a key, keep the endpoint working with a clear "LLM not configured" message and make the rest of the app unaffected.

=====================================================
9. TESTS AND DESIGN NOTE
=====================================================
Tests (backend, run with npm test). At least these:
1. Full attendance, zero LOP: gross equals the monthly salary and net is correct after the deduction.
2. Mixed attendance with absences and half-days: LOP days and amounts are correct (show the numbers in the test).
3. Half-days only: 0.5 each counted correctly, with rounding behaviour.
4. Invalid input is rejected (negative count, or total exceeding working days).
5. Tenant isolation: an Admin of Company A requesting Company B's employee/payroll gets 404.
6. Role check: an Employee cannot run payroll and cannot read another employee's payroll.
Tests 1-4 can be pure unit tests on the calculator. 5-6 should be API-level tests (mongodb-memory-server or a test database, whichever is simpler and doesn't touch my real data).

DESIGN.md (short but clear, around 1-2 pages): architecture overview, data model, how multi-tenancy is enforced (and why companyId comes from the token), how RBAC works, the payroll formula with a worked example, the assumptions made, how the LLM endpoint stays safe, trade-offs, and "what I'd do next with more time".

=====================================================
10. ORDER OF WORK
=====================================================
1. Create the folders and memory files (README, DESIGN, API, PROGRESS, .gitignore, .env.example).
2. Build the backend: models, calculator, auth, middleware, routes, controllers, seed. Write the tests.
3. Pause for the MongoDB Atlas guide and URI (section 5). Connect, seed, run the tests, and verify tenant isolation by hand.
4. Build the frontend against the real API.
5. Build the bonus /ask endpoint and the Ask AI page (ask for the LLM key then).
6. Polish: responsive checks at the three widths, dark mode, loading/empty/error states, final docs update.
7. Run everything once more (server, client, tests, seed) and fix any issue.

=====================================================
11. FINAL DELIVERABLE: GUIDE AND TOUR
=====================================================
When everything is finished, give me a detailed but friendly walkthrough, written so I can confidently explain the project in an interview:
- The exact commands to run the project from scratch (install, env, seed, dev servers, tests).
- The demo credentials for each role and company, and a step-by-step demo script (log in as Company A admin, run payroll, switch to Company B admin to show isolation, log in as an employee to show restricted access, try the Ask AI).
- A file-by-file tour of the codebase: what each folder and key file does and how a request flows through it (frontend page > api call > route > middleware > controller > model).
- A plain-language explanation of the payroll formula with a worked example.
- How multi-tenancy and RBAC are enforced, and where in the code to point if an interviewer asks.
- The assumptions you made, the known limitations, and 5-6 likely interview questions about this project with short model answers.
- A short note on how to deploy it (Render/Railway for the server, Vercel/Netlify for the client) in case I want a live link.
Also make sure README.md contains the essentials of this so the repo stands on its own.

Start now with step 1. Don't ask me anything until you need the MongoDB URI.