const { pool } = require('../config/db');

// Helper function to create expenses table if it doesn't exist
async function createExpensesTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      trip_id INT NULL, -- Can be null if expense is not tied to a specific trip
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type ENUM('credit', 'debit') NOT NULL,
      expense_date DATE NOT NULL,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL -- Or CASCADE if expenses should be deleted with trip
    );
  `;
  try {
    const [rows, fields] = await pool.execute(createTableQuery);
    if (rows.warningStatus === 0) {
      // console.log("Expenses table checked/created successfully.");
    }
  } catch (error) {
    console.error('Error creating expenses table:', error);
  }
}

// Call this function once when the module is loaded
createExpensesTableIfNotExists();

// Add a new expense or income
exports.addExpense = async (req, res) => {
  const { trip_id, description, amount, type, expense_date, category } = req.body;
  const userId = req.user.id; // From authMiddleware

  if (!description || !amount || !type || !expense_date) {
    return res.status(400).json({ msg: 'Description, amount, type (credit/debit), and date are required.' });
  }
  if (type !== 'credit' && type !== 'debit') {
    return res.status(400).json({ msg: 'Type must be either "credit" or "debit".' });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ msg: 'Amount must be a positive number.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO expenses (user_id, trip_id, description, amount, type, expense_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, trip_id || null, description, parsedAmount, type, new Date(expense_date).toISOString().slice(0,10), category || null]
    );
    res.status(201).json({ 
        msg: 'Transaction added successfully', 
        expenseId: result.insertId,
        data: { id: result.insertId, userId, trip_id: trip_id || null, description, amount: parsedAmount, type, expense_date, category: category || null }
    });
  } catch (err) {
    console.error('Server error during expense addition:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all expenses for a specific trip
exports.getExpensesByTrip = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const [expenses] = await pool.execute(
      'SELECT * FROM expenses WHERE user_id = ? AND trip_id = ? ORDER BY expense_date DESC, created_at DESC',
      [userId, tripId]
    );
    res.json(expenses);
  } catch (err) {
    console.error('Server error while fetching trip expenses:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all expenses for the logged-in user (can be filtered by type or date range later)
exports.getAllUserExpenses = async (req, res) => {
    const userId = req.user.id;
    try {
        const [expenses] = await pool.execute(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, created_at DESC',
            [userId]
        );
        res.json(expenses);
    } catch (err) {
        console.error('Server error while fetching all user expenses:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};


// Get expense summary for a specific trip (total credit, debit, balance)
exports.getTripExpenseSummary = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const [summary] = await pool.execute(
      `SELECT 
         SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
         SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit
       FROM expenses 
       WHERE user_id = ? AND trip_id = ?`,
      [userId, tripId]
    );
    
    const totalCredit = parseFloat(summary[0].total_credit) || 0;
    const totalDebit = parseFloat(summary[0].total_debit) || 0;
    const balance = totalCredit - totalDebit;

    res.json({
      trip_id: tripId,
      total_credit: totalCredit,
      total_debit: totalDebit,
      balance: balance
    });
  } catch (err) {
    console.error('Server error while fetching trip expense summary:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get overall expense summary for the logged-in user
exports.getUserExpenseSummary = async (req, res) => {
    const userId = req.user.id;
    try {
        const [summary] = await pool.execute(
            `SELECT 
               SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
               SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit
             FROM expenses 
             WHERE user_id = ?`,
            [userId]
        );

        const totalCredit = parseFloat(summary[0].total_credit) || 0;
        const totalDebit = parseFloat(summary[0].total_debit) || 0;
        const balance = totalCredit - totalDebit;

        res.json({
            user_id: userId,
            total_credit: totalCredit,
            total_debit: totalDebit,
            balance: balance
        });
    } catch (err) {
        console.error('Server error while fetching user expense summary:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};