const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting on login (max 5 attempts per 15 minutes)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { status: 'error', message: 'Too many login attempts, please try again after 15 minutes' }
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

router.post('/register', [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, register);

router.post('/login', loginLimiter, [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], validate, login);

router.post('/logout', logout);
router.get('/me', auth, getMe);

module.exports = router;
