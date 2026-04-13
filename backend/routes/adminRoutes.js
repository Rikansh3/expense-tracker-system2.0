const express = require('express');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// Protect all routes with auth AND admin middleware
router.use(auth);
router.use(admin);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
