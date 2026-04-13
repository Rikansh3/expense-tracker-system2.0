const express = require('express');
const { body, validationResult } = require('express-validator');
const { getBudgets, createOrUpdateBudget, deleteBudget } = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

const budgetValidation = [
    body('category_id').notEmpty().withMessage('Category is required').isInt(),
    body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0 }),
    body('month').notEmpty().isInt({ min: 1, max: 12 }),
    body('year').notEmpty().isInt({ min: 2000 })
];

router.use(auth); // Protect all routes

router.get('/', getBudgets);
router.post('/', budgetValidation, validate, createOrUpdateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
