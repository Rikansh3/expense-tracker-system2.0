const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAllRecurring, createRecurring, updateRecurring, deleteRecurring } = require('../controllers/recurringController');
const { auth } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

const recurringValidation = [
    body('title').notEmpty().withMessage('Title is required').trim().escape(),
    body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
    body('next_date').notEmpty().withMessage('Next date is required').isISO8601()
];

router.use(auth);

router.get('/', getAllRecurring);
router.post('/', recurringValidation, validate, createRecurring);
router.put('/:id', recurringValidation, validate, updateRecurring);
router.delete('/:id', deleteRecurring);

module.exports = router;
