const allowedCategories = [
  'Groceries',
  'Leisure',
  'Electronics',
  'Utilities',
  'Clothing',
  'Health',
  'Others'
];

export function validateExpense(
  amount: unknown,
  category: unknown,
  expense_date: unknown
): string | null {
  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 'Amount must be a positive number';
  }

  const amountString = amount.toString();

  const decimalPart = amountString.split('.')[1];

  if (decimalPart && decimalPart.length > 2) {
    return 'Amount can have at most 2 decimal places';
  }

  if (
    typeof category !== 'string' ||
    !allowedCategories.includes(category)
  ) {
    return 'Invalid category';
  }

  if (expense_date === undefined) {
    return 'expense_date is required';
  }

  if (typeof expense_date !== 'string') {
    return 'expense_date must be a string';
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(expense_date)) {
    return 'Invalid expense date. Use YYYY-MM-DD';
  }

  const [year, month, day] = expense_date.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return 'Invalid expense date';
  }

  return null;
}