const express = require('express');
const { getDashboardStats, getReports, exportCSV, exportPDF } = require('../controllers/statController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Protect all routes

router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

module.exports = router;
