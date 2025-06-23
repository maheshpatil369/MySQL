const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, expenseController.addExpense);


router.get('/trip/:tripId', authMiddleware, expenseController.getExpensesByTrip);


router.get('/trip/:tripId/summary', authMiddleware, expenseController.getTripExpenseSummary);


router.get('/user', authMiddleware, expenseController.getAllUserExpenses);


router.get('/user/summary', authMiddleware, expenseController.getUserExpenseSummary);

module.exports = router;