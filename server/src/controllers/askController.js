const { findEmployeeByName, getPayrollRecord, resolveMonth } = require('../services/payrollQueryService');
async function fallbackParser(caller, question) {
  const q = question.toLowerCase();

  const monthMatch = q.match(/(january|february|march|april|may|june|july|august|september|october|november|december|\d{4}-\d{2})/i);
  const monthStr = monthMatch ? monthMatch[0] : new Date().toISOString().slice(0, 7);

  let extractedName = null;
  const namePattern = /(?:is|for|of)\s+([a-zA-Z]+)(?:'s)?/i;
  const match = q.match(namePattern);
  if (match && match[1]) {
    const candidate = match[1].toLowerCase();
    if (!['the', 'my', 'his', 'her', 'october', 'net', 'gross', 'salary', 'payroll'].includes(candidate)) {
      extractedName = match[1];
    }
  }

  if (q.includes('my salary') || q.includes('my net') || (!extractedName && caller.role === 'employee')) {
    extractedName = caller.name.split(' ')[0];
  }

  if (!extractedName) {
    return {
      answered: false,
      message: 'Could not identify the employee name. Try: "What is Ramesh\'s net salary for October?"',
    };
  }

  const empLookup = await findEmployeeByName(caller, extractedName);
  if (!empLookup.found) {
    return {
      answered: true,
      message: empLookup.message,
    };
  }

  if (empLookup.ambiguous) {
    return {
      answered: true,
      message: empLookup.message,
      data: empLookup.employees,
    };
  }

  const employee = empLookup.employee || (empLookup.employees && empLookup.employees[0]);
  const payrollResult = await getPayrollRecord(caller, employee._id, monthStr);

  if (!payrollResult.success) {
    return {
      answered: true,
      message: payrollResult.message,
    };
  }

  const data = payrollResult.data;
  return {
    answered: true,
    message: `${data.employeeName}'s net salary for ${data.month} is ₹${data.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Earned Gross: ₹${data.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })} after ${data.lopDays} LOP days, with ₹${data.deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })} in deductions).`,
    data,
  };
}
async function askPayrollQuestion(req, res, next) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid plain-English question is required.',
      });
    }

    const trimmedQuestion = question.trim();

    const result = await fallbackParser(req.user, trimmedQuestion);

    return res.status(200).json({
      success: true,
      question: trimmedQuestion,
      answer: result.message,
      data: result.data || null,
      llmActive: Boolean(process.env.LLM_API_KEY),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  askPayrollQuestion,
};
