const express = require('express');
const router = express.Router();
const {login, register, forgotPassword, resetPassword, activate} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/activate/:token', activate);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token',resetPassword);

module.exports = router;    