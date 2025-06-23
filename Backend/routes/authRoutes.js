const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware


router.post('/register', authController.registerUser);


router.post('/login', authController.loginUser);


router.put('/profile', authMiddleware, authController.updateUserProfile);

module.exports = router;