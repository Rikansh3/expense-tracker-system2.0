const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

const transactionValidation = [
    body('category_id').notEmpty().withMessage('Category is required').isInt(),
    body('title').notEmpty().withMessage('Title is required').trim().escape(),
    body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date').notEmpty().withMessage('Date is required').isISO8601()
];

router.use(auth); // Protect all routes

router.get('/', getAllTransactions);

router.post('/', upload.single('receipt_image'), transactionValidation, validate, createTransaction);

router.put('/:id', upload.single('receipt_image'), transactionValidation, validate, updateTransaction);

router.delete('/:id', deleteTransaction);

module.exports = router;
