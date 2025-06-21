const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/expenses
// @desc    Add a new expense or income transaction
// @access  Private
router.post('/', authMiddleware, expenseController.addExpense);

// @route   GET api/expenses/trip/:tripId
// @desc    Get all expenses for a specific trip
// @access  Private
router.get('/trip/:tripId', authMiddleware, expenseController.getExpensesByTrip);

// @route   GET api/expenses/trip/:tripId/summary
// @desc    Get expense summary for a specific trip
// @access  Private
router.get('/trip/:tripId/summary', authMiddleware, expenseController.getTripExpenseSummary);

// @route   GET api/expenses/user
// @desc    Get all expenses for the logged-in user
// @access  Private
router.get('/user', authMiddleware, expenseController.getAllUserExpenses);

// @route   GET api/expenses/user/summary
// @desc    Get overall expense summary for the logged-in user
// @access  Private
router.get('/user/summary', authMiddleware, expenseController.getUserExpenseSummary);

module.exports = router;