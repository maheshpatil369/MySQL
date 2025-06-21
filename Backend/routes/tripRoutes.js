const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/trips
// @desc    Create a new trip plan
// @access  Private
router.post('/', authMiddleware, tripController.createTrip);

// @route   GET api/trips
// @desc    Get all trips for the logged-in user
// @access  Private
router.get('/', authMiddleware, tripController.getMyTrips);

// @route   GET api/trips/:id
// @desc    Get a specific trip by ID
// @access  Private
router.get('/:id', authMiddleware, tripController.getTripById);

module.exports = router;