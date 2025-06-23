const express = require('express');
const router = express.Router();
const calendarMarkController = require('../controllers/calendarMarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, calendarMarkController.getUserMarks);


router.post('/', authMiddleware, calendarMarkController.createOrUpdateMark);

router.delete('/:id', authMiddleware, calendarMarkController.deleteMarkById);


router.put('/lock/:mark_date', authMiddleware, calendarMarkController.updateMarkLockStatus);

module.exports = router;