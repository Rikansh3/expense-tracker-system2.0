const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

const categoryValidation = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('icon').notEmpty().withMessage('Icon is required').trim(),
    body('color').notEmpty().withMessage('Color is required').trim(),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense')
];

router.use(auth); // Protect all routes

router.get('/', getAllCategories);
router.post('/', categoryValidation, validate, createCategory);
router.put('/:id', categoryValidation, validate, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
