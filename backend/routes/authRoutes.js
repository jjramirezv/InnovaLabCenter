const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas: /api/auth/register y /api/auth/login
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
module.exports = router;