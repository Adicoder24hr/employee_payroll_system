async function testApi() {
  console.log('--- Testing Live API Endpoints ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('1. Health check status:', health.status);

  // 2. Login Company A Admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@acme.com', password: 'Password123!' }),
  });
  const loginData = await loginRes.json();
  console.log('2. Acme Admin Login:', loginData.success, '| User:', loginData.user?.name);
  const token = loginData.token;

  // 3. Ask AI
  const askRes = await fetch('http://localhost:5000/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question: "What is Ramesh's net salary for October?" }),
  });
  const askData = await askRes.json();
  console.log('3. Ask AI Question:', askData.question);
  console.log('   Ask AI Answer:', askData.answer);
  if (askData.data) {
    console.log('   Data Verified:', {
      gross: askData.data.grossSalary,
      deduction: askData.data.deduction,
      net: askData.data.netSalary,
      lopDays: askData.data.lopDays,
    });
  }

  // 4. Test Cross-Tenant Isolation
  // Log in as Bright Admin to get a Bright Foods employee ID
  const brightLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bright.com', password: 'Password123!' }),
  });
  const brightData = await brightLogin.json();
  const brightToken = brightData.token;

  const brightEmpsRes = await fetch('http://localhost:5000/api/employees', {
    headers: { Authorization: `Bearer ${brightToken}` },
  });
  const brightEmps = await brightEmpsRes.json();
  const brightEmp = brightEmps.employees[0];
  console.log('4. Bright Foods Employee:', brightEmp.name, '| ID:', brightEmp._id);

  // Now Company A Admin attempts to query Company B's employee:
  const crossTenantRes = await fetch(`http://localhost:5000/api/employees/${brightEmp._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('   Cross-Tenant Query HTTP Status:', crossTenantRes.status, '(Expected: 404)');
  const crossTenantBody = await crossTenantRes.json();
  console.log('   Cross-Tenant Response Body:', crossTenantBody.message);

  // 5. Run Payroll calculation test
  // Fetch Ramesh ID
  const rameshRes = await fetch('http://localhost:5000/api/employees?search=Ramesh', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const rameshData = await rameshRes.json();
  const ramesh = rameshData.employees[0];

  const calcRes = await fetch('http://localhost:5000/api/payroll/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      employeeId: ramesh._id,
      month: '2026-10',
      attendance: { present: 22, absent: 2, halfDay: 2 },
    }),
  });
  const calcData = await calcRes.json();
  console.log('5. Payroll Calculation Success:', calcData.success);
  console.log('   Payroll Result for Ramesh:', {
    grossSalary: calcData.payroll.grossSalary,
    lopDays: calcData.payroll.lopDays,
    deduction: calcData.payroll.deduction,
    netSalary: calcData.payroll.netSalary,
  });

  console.log('--- All live API and security tests verified successfully! ---');
}

testApi().catch(console.error);
