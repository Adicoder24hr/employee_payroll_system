# REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication:** `Authorization: Bearer <JWT_TOKEN>`  
**Content-Type:** `application/json`

---

## 1. Authentication Endpoints

### 1.1 User Login
Authenticates an administrator or employee and returns a signed JWT.

- **Method:** `POST`
- **Path:** `/auth/login`
- **Auth Required:** None (Public)
- **Rate Limit:** 10 requests per minute per IP

#### Request Body
```json
{
  "email": "admin@acme.com",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671e72a8c3e4a91b2c123456",
    "name": "Acme Admin",
    "email": "admin@acme.com",
    "role": "admin",
    "designation": "HR Administrator",
    "company": {
      "id": "671e72a8c3e4a91b2c111111",
      "name": "Acme Textiles",
      "code": "ACME"
    }
  }
}
```

#### Error Responses
- `400 Bad Request`: Validation failure (missing email or password).
- `401 Unauthorized`: Invalid email or password.
- `429 Too Many Requests`: Exceeded rate limit.

---

### 1.2 Get Current User Profile
Retrieves the logged-in user's profile and company metadata.

- **Method:** `GET`
- **Path:** `/auth/me`
- **Auth Required:** Yes (`admin` or `employee`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "user": {
    "id": "671e72a8c3e4a91b2c123456",
    "name": "Ramesh Kumar",
    "email": "ramesh@acme.com",
    "role": "employee",
    "designation": "Senior Weaver & Supervisor",
    "monthlySalary": 60000,
    "company": {
      "id": "671e72a8c3e4a91b2c111111",
      "name": "Acme Textiles",
      "code": "ACME"
    }
  }
}
```

#### Error Responses
- `401 Unauthorized`: Missing, expired, or invalid token.

---

## 2. Company Endpoints

### 2.1 Get Current Company Metadata
Retrieves tenant company details and working days configuration.

- **Method:** `GET`
- **Path:** `/companies/me`
- **Auth Required:** Yes (`admin` or `employee`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "company": {
    "id": "671e72a8c3e4a91b2c111111",
    "name": "Acme Textiles",
    "code": "ACME",
    "defaultWorkingDays": 26,
    "defaultDeductionPercentage": 10,
    "workingDaysConfig": {
      "2026-10": 26,
      "2026-11": 25,
      "2026-12": 26
    }
  }
}
```

---

### 2.2 Update Monthly Working Days Config
Configures working days for a specific month or updates defaults.

- **Method:** `PUT`
- **Path:** `/companies/me/working-days`
- **Auth Required:** Yes (`admin` only)

#### Request Body
```json
{
  "month": "2026-11",
  "days": 25
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Working days updated for 2026-11",
  "workingDaysConfig": {
    "2026-10": 26,
    "2026-11": 25
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid month format (must be YYYY-MM) or days outside range (1-31).
- `403 Forbidden`: User role is `employee`.

---

## 3. Employee Endpoints

### 3.1 List Company Employees
Returns all employees belonging to the caller's company.

- **Method:** `GET`
- **Path:** `/employees`
- **Auth Required:** Yes (`admin` only)
- **Query Params (Optional):**
  - `search`: Filter by name, email, or designation
  - `role`: Filter by `employee` or `admin`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 5,
  "employees": [
    {
      "id": "671e72a8c3e4a91b2c123456",
      "name": "Ramesh Kumar",
      "email": "ramesh@acme.com",
      "role": "employee",
      "designation": "Senior Weaver & Supervisor",
      "monthlySalary": 60000,
      "isActive": true
    }
  ]
}
```

---

### 3.2 Create Employee
Creates a new employee within the caller's company.

- **Method:** `POST`
- **Path:** `/employees`
- **Auth Required:** Yes (`admin` only)

#### Request Body
```json
{
  "name": "Priya Sharma",
  "email": "priya@acme.com",
  "password": "Password123!",
  "role": "employee",
  "designation": "Quality Analyst",
  "monthlySalary": 55000
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Employee created successfully",
  "employee": {
    "id": "671e72a8c3e4a91b2c999999",
    "name": "Priya Sharma",
    "email": "priya@acme.com",
    "role": "employee",
    "designation": "Quality Analyst",
    "monthlySalary": 55000,
    "isActive": true
  }
}
```

#### Error Responses
- `400 Bad Request`: Validation failure or duplicate email within company.
- `403 Forbidden`: Caller is not an admin.

---

## 4. Payroll Endpoints

### 4.1 Calculate & Save Payroll
Calculates monthly payroll metrics from attendance counts and upserts the record.

- **Method:** `POST`
- **Path:** `/payroll/calculate`
- **Auth Required:** Yes (`admin` only)

#### Request Body
```json
{
  "employeeId": "671e72a8c3e4a91b2c123456",
  "month": "2026-10",
  "attendance": {
    "present": 22,
    "absent": 2,
    "halfDay": 2
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Payroll calculated and saved successfully",
  "payroll": {
    "id": "671e72a8c3e4a91b2c888888",
    "employeeId": "671e72a8c3e4a91b2c123456",
    "employeeName": "Ramesh Kumar",
    "designation": "Senior Weaver & Supervisor",
    "month": "2026-10",
    "workingDays": 26,
    "presentDays": 22,
    "absentDays": 2,
    "halfDays": 2,
    "lopDays": 3.0,
    "monthlySalary": 60000.00,
    "perDaySalary": 2307.69,
    "lopAmount": 6923.08,
    "grossSalary": 53076.92,
    "deductionRate": 10,
    "deduction": 5307.69,
    "netSalary": 47769.23,
    "calculatedAt": "2026-10-27T17:30:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid month format, negative counts, or sum exceeding working days.
- `404 Not Found`: Employee does not exist within the caller's company.
- `403 Forbidden`: Caller is an employee.

---

### 4.2 Get Payroll for Employee & Month
Fetches a computed payroll record for a specific employee and month.

- **Method:** `GET`
- **Path:** `/payroll/:employeeId/:month`
- **Auth Required:** Yes (`admin` can access any employee in their company; `employee` can only access their own ID)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "payroll": {
    "id": "671e72a8c3e4a91b2c888888",
    "employeeId": "671e72a8c3e4a91b2c123456",
    "employeeName": "Ramesh Kumar",
    "month": "2026-10",
    "workingDays": 26,
    "presentDays": 22,
    "absentDays": 2,
    "halfDays": 2,
    "lopDays": 3.0,
    "monthlySalary": 60000.00,
    "perDaySalary": 2307.69,
    "lopAmount": 6923.08,
    "grossSalary": 53076.92,
    "deduction": 5307.69,
    "netSalary": 47769.23
  }
}
```

#### Error Responses
- `403 Forbidden`: An employee requests another employee's record.
- `404 Not Found`: Record does not exist, or employee belongs to another tenant.

---

### 4.3 Get Current Employee's Payroll History
Retrieves all historical payroll records for the authenticated employee.

- **Method:** `GET`
- **Path:** `/payroll/me`
- **Auth Required:** Yes (`employee` or `admin`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 3,
  "records": [
    {
      "month": "2026-10",
      "workingDays": 26,
      "grossSalary": 53076.92,
      "deduction": 5307.69,
      "netSalary": 47769.23,
      "lopDays": 3.0
    }
  ]
}
```

---

## 5. Natural Language Query (Bonus Endpoint)

### 5.1 Ask Payroll AI
Answers natural-language payroll queries using tool calling against verified database services.

- **Method:** `POST`
- **Path:** `/ask`
- **Auth Required:** Yes (`admin` or `employee`)

#### Request Body
```json
{
  "question": "What is Ramesh's net salary for October?"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "question": "What is Ramesh's net salary for October?",
  "answer": "Ramesh Kumar's net salary for October 2026 is ₹47,769.23 (Gross: ₹53,076.92 after 3.0 LOP days, minus ₹5,307.69 deduction).",
  "data": {
    "employeeName": "Ramesh Kumar",
    "month": "2026-10",
    "grossSalary": 53076.92,
    "lopDays": 3.0,
    "deduction": 5307.69,
    "netSalary": 47769.23
  }
}
```

#### Error Responses
- `400 Bad Request`: Question string is empty.
- `403 Forbidden`: Tool execution attempted cross-employee access forbidden to caller role.
- `503 Service Unavailable`: LLM API key not configured or upstream API failure.
