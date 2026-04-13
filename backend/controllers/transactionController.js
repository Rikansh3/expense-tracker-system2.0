const db = require('../config/db');

const getAllTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM transactions WHERE user_id = ?';
        const queryParams = [userId];

        // Filters
        if (req.query.type) {
            query += ' AND type = ?';
            queryParams.push(req.query.type);
        }
        if (req.query.category_id) {
            query += ' AND category_id = ?';
            queryParams.push(req.query.category_id);
        }
        if (req.query.start_date && req.query.end_date) {
            query += ' AND date BETWEEN ? AND ?';
            queryParams.push(req.query.start_date, req.query.end_date);
        }
        if (req.query.search) {
            query += ' AND (title LIKE ? OR amount = ?)';
            queryParams.push(`%${req.query.search}%`, req.query.search);
        }

        query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);

        const [transactions] = await db.query(query, queryParams);

        // Count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?';
        const countParams = [userId];
        
        // Re-apply filters for count
        if (req.query.type) { countQuery += ' AND type = ?'; countParams.push(req.query.type); }
        if (req.query.category_id) { countQuery += ' AND category_id = ?'; countParams.push(req.query.category_id); }
        if (req.query.start_date && req.query.end_date) { countQuery += ' AND date BETWEEN ? AND ?'; countParams.push(req.query.start_date, req.query.end_date); }
        if (req.query.search) { countQuery += ' AND (title LIKE ? OR amount = ?)'; countParams.push(`%${req.query.search}%`, req.query.search); }
        
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].count;

        res.json({
            status: 'success',
            data: transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const createTransaction = async (req, res) => {
    try {
        const { category_id, title, amount, type, date, note, payment_method } = req.body;
        const userId = req.user.id;
        const receipt_image = req.file ? req.file.filename : null;

        const [result] = await db.query(
            'INSERT INTO transactions (user_id, category_id, title, amount, type, date, note, payment_method, receipt_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, category_id, title, amount, type, date, note, payment_method, receipt_image]
        );

        const [newTransaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);

        res.status(201).json({ status: 'success', data: newTransaction[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, title, amount, type, date, note, payment_method } = req.body;
        const userId = req.user.id;
        
        const [existing] = await db.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Transaction not found' });
        }

        let receipt_image = existing[0].receipt_image;
        if (req.file) {
            receipt_image = req.file.filename;
        }

        await db.query(
            'UPDATE transactions SET category_id = ?, title = ?, amount = ?, type = ?, date = ?, note = ?, payment_method = ?, receipt_image = ? WHERE id = ? AND user_id = ?',
            [category_id, title, amount, type, date, note, payment_method, receipt_image, id, userId]
        );

        const [updated] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
        res.json({ status: 'success', data: updated[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Transaction not found' });
        }

        res.json({ status: 'success', message: 'Transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = {
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
};
