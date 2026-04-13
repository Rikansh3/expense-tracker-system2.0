const db = require('../config/db');
const { processRecurring } = require('./recurringController');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Auto-add due recurring transactions
        await processRecurring(userId);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Total Balance
        const [balanceResult] = await db.query(
            "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance FROM transactions WHERE user_id = ?",
            [userId]
        );
        const totalBalance = balanceResult[0].balance || 0;

        // Monthly Income & Expense
        const [monthlyResult] = await db.query(
            "SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY type",
            [userId, currentMonth, currentYear]
        );
        
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        monthlyResult.forEach(row => {
            if (row.type === 'income') monthlyIncome = row.total;
            if (row.type === 'expense') monthlyExpense = row.total;
        });

        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

        // 6-month trend (income vs expense)
        const [trendResult] = await db.query(
            `SELECT DATE_FORMAT(date, '%Y-%m') as month, type, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
             GROUP BY month, type ORDER BY month ASC`,
            [userId]
        );

        // Expense by Category (Current month)
        const [categoryExpense] = await db.query(
            `SELECT c.name, c.color, SUM(t.amount) as total 
             FROM transactions t 
             JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.date) = ? AND YEAR(t.date) = ?
             GROUP BY c.id ORDER BY total DESC`,
            [userId, currentMonth, currentYear]
        );

        // Recent 10 transactions
        const [recentTransactions] = await db.query(
            `SELECT t.*, c.name as category_name, c.color, c.icon 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? 
             ORDER BY t.date DESC, t.id DESC LIMIT 10`,
            [userId]
        );

        res.json({
            status: 'success',
            data: {
                summary: {
                    totalBalance,
                    monthlyIncome,
                    monthlyExpense,
                    savingsRate: savingsRate > 0 ? savingsRate : 0
                },
                trend: trendResult,
                categoryExpense,
                recentTransactions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const getReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year || new Date().getFullYear();

        // Monthly comparison for selected year
        const [monthlyComparison] = await db.query(
            `SELECT MONTH(date) as month, type, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = ? AND YEAR(date) = ?
             GROUP BY month, type ORDER BY month ASC`,
            [userId, year]
        );

        // Top spending categories for year
        const [topCategories] = await db.query(
            `SELECT c.name, c.color, SUM(t.amount) as total 
             FROM transactions t 
             JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = ? AND t.type = 'expense' AND YEAR(t.date) = ?
             GROUP BY c.id ORDER BY total DESC LIMIT 5`,
            [userId, year]
        );

        res.json({
            status: 'success',
            data: {
                monthlyComparison,
                topCategories
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const exportCSV = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year || new Date().getFullYear();

        const [transactions] = await db.query(
            `SELECT DATE_FORMAT(t.date, '%Y-%m-%d') as date, t.title, c.name as category, t.type, t.amount, t.note 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND YEAR(t.date) = ?
             ORDER BY t.date DESC`,
            [userId, year]
        );

        const fields = ['date', 'title', 'category', 'type', 'amount', 'note'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(transactions);

        res.header('Content-Type', 'text/csv');
        res.attachment(`Expense_Report_${year}.csv`);
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating CSV' });
    }
};

const exportPDF = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year || new Date().getFullYear();

        const [transactions] = await db.query(
            `SELECT DATE_FORMAT(t.date, '%Y-%m-%d') as date, t.title, c.name as category, t.type, t.amount 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND YEAR(t.date) = ?
             ORDER BY t.date DESC`,
            [userId, year]
        );

        const doc = new PDFDocument({ margin: 50 });
        const filename = `Expense_Report_${year}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('Financial Report', { align: 'center' });
        doc.fontSize(12).text(`Year: ${year}`, { align: 'center' });
        doc.moveDown();
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Table Header
        const tableTop = 150;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, tableTop);
        doc.text('Title', 120, tableTop);
        doc.text('Category', 250, tableTop);
        doc.text('Type', 350, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Rows
        let y = tableTop + 25;
        doc.font('Helvetica');
        transactions.forEach(t => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            doc.text(new Date(t.date).toLocaleDateString(), 50, y);
            doc.text(t.title, 120, y, { width: 120 });
            doc.text(t.category, 250, y);
            doc.text(t.type, 350, y);
            doc.text(t.amount.toString(), 450, y, { align: 'right' });
            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error generating PDF' });
    }
};

module.exports = {
    getDashboardStats,
    getReports,
    exportCSV,
    exportPDF
};
