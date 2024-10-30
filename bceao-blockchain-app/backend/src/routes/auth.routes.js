// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

module.exports = router;