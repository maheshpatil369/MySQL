const express = require('express');
const router = express.Router();
const calendarMarkController = require('../controllers/calendarMarkController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all marks for the authenticated user
router.get('/', authMiddleware, calendarMarkController.getUserMarks);

// Create or Update a mark for a specific date (idempotent operation)
// The combination of user_id and mark_date is unique.
router.post('/', authMiddleware, calendarMarkController.createOrUpdateMark);

// Delete a specific mark by its ID
// Note: Using mark ID for deletion. If deleting by date, the route would be different.
router.delete('/:id', authMiddleware, calendarMarkController.deleteMarkById);

// Route to specifically update lock status for a mark on a given date
// Example: PUT /api/calendarmarks/lock/2024-12-25
// Body: { "is_locked": true }
router.put('/lock/:mark_date', authMiddleware, calendarMarkController.updateMarkLockStatus);

module.exports = router;