const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, tripController.createTrip);


router.get('/', authMiddleware, tripController.getMyTrips);


router.get('/:id', authMiddleware, tripController.getTripById);

module.exports = router;