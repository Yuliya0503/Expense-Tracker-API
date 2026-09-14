import express from 'express';
import pool from './db.js';
import 'dotenv/config';

import { validateExpense } from './validators/expenseValidator.js';
import { authMiddleware } from './authMiddleware.js';
import authRouter from './routes/authRoutes.js';
import { isValidDateString } from './validators/dateValidator.js';

const app = express();

app.use(express.json()); 
app.use('/auth', authRouter);

app.get('/expenses',authMiddleware, async(req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
  
  const  { period, from, to } = req.query;

  if (
    period !== undefined &&
    period !== 'week' &&
    period !== 'month' &&
    period !== '3months'
  ) {
    return res.status(400).json({
      message: 'Invalid period'
    })
  }

  if (period && (from || to)) {
    return res.status(400).json({
      message: 'Use either period or from/to, not both'
    });
  } 

  if((from && !to) || (!from && to)) {
    return res.status(400).json({
      message: 'Both from and to dates are required'
    });
  }

  if (from && to) {
    const fromDate = from as string;
    const toDate = to as string;

    if (
      !isValidDateString(fromDate) ||
      !isValidDateString(toDate)
    ) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        message: '`from` date cannot be later than `to` date'
      });
    }
  }

  try {
    let query = `
      SELECT id, amount, category, expense_date 
      FROM expenses 
      WHERE user_id = $1
    `;

    const params: string[] = [req.userId];
    
    if (period === 'week') {
      query += `
        AND expense_date >= NOW() - INTERVAL '7 days'
      `;
    } else if(period === 'month') {
      query += `
        AND expense_date >= NOW() - INTERVAL '1 month'
      `;
    } else if (period === '3months') {
      query += `
        AND expense_date >= NOW() - INTERVAL '3 months'
      `;
    }

    if(from && to) {
      query += `
        AND expense_date >= $2
        AND expense_date < ($3::date + INTERVAL '1 day')
      `;
      params.push(from as string, to as string);
    }

    query += `
      ORDER BY expense_date DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows)
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to get expenses'
    })
  }  
})

app.post('/expenses',authMiddleware, async(req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
  
  const { amount, category, expense_date } = req.body;
  
  const validationError = validateExpense(
    amount,
    category,
    expense_date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO expenses (user_id, amount, category, expense_date)
        VALUES ($1, $2, $3, $4)
        RETURNING id, amount, category, expense_date
      `,
      [req.userId, amount, category, expense_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create expense'
    });
  }
  
})

app.get('/expenses/:id', authMiddleware, async(req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT id, amount, category, expense_date
        FROM expenses
        WHERE id = $1
          AND user_id = $2
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to get expense'
    });
  }

  
})

app.put('/expenses/:id', authMiddleware, async(req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const { id } = req.params;

  const { amount, category, expense_date } = req.body;
  const validationError = validateExpense(
    amount,
    category,
    expense_date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
        UPDATE expenses
        SET amount = $1,
            category = $2,
            expense_date = $3
        WHERE id = $4
          AND user_id = $5
        RETURNING id, amount, category, expense_date
      `,
      [amount, category, expense_date, id, req.userId]
    );

    if(result.rows.length === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to update expense'
    });
  }

});

app.delete('/expenses/:id', authMiddleware, async(req, res) => {
  if(!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        DELETE FROM expenses
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    res.json({
      message: 'Expense deleted'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to delete expense'
    });
  }
})

app.patch('/expenses/:id', authMiddleware, async(req, res) => {
  if(!req.userId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const { id } = req.params;
  const { amount, category, expense_date } = req.body;

  if (
    amount === undefined &&
    category === undefined &&
    expense_date === undefined
  ) {
    return res.status(400).json({
      message: 'At least one field is required'
    });
  }

  try {
    const existingExpense = await pool.query(
    `
      SELECT
        amount::float8 AS amount,
        category,
        expense_date
      FROM expenses
      WHERE id = $1
        AND user_id = $2
    `,
    [id, req.userId]
  );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    const currentExpense = existingExpense.rows[0];

    const newAmount = amount ?? currentExpense.amount;
    const newCategory = category ?? currentExpense.category;
    const newExpenseDate = expense_date ?? currentExpense.expense_date;
    const expenseDateForValidation =
      typeof newExpenseDate === 'string'
        ? newExpenseDate
        : newExpenseDate.toISOString().slice(0, 10);
    const validationError = validateExpense(
      newAmount,
      newCategory,
      expenseDateForValidation
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const result = await pool.query(
      `
        UPDATE expenses
        SET amount = $1,
            category = $2,
            expense_date = $3
        WHERE id = $4
          AND user_id = $5
        RETURNING id, amount, category, expense_date
      `,
      [
        newAmount,
        newCategory,
        newExpenseDate,
        id,
        req.userId
      ]
    );
    res.json(result.rows[0]);

  } catch( error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to partially update expense'
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});