const db = require('../config/db');
const moment = require('moment');

const getAllRecurring = async (req, res) => {
    try {
        const userId = req.user.id;
        const [recurring] = await db.query('SELECT * FROM recurring WHERE user_id = ?', [userId]);
        res.json({ status: 'success', data: recurring });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const createRecurring = async (req, res) => {
    try {
        const { title, amount, type, frequency, next_date } = req.body;
        const userId = req.user.id;

        const [result] = await db.query(
            'INSERT INTO recurring (user_id, title, amount, type, frequency, next_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, amount, type, frequency, next_date]
        );

        const [newRecurring] = await db.query('SELECT * FROM recurring WHERE id = ?', [result.insertId]);
        res.status(201).json({ status: 'success', data: newRecurring[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const updateRecurring = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, type, frequency, next_date, active } = req.body;
        const userId = req.user.id;

        const [existing] = await db.query('SELECT * FROM recurring WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Recurring transaction not found' });
        }

        await db.query(
            'UPDATE recurring SET title = ?, amount = ?, type = ?, frequency = ?, next_date = ?, active = ? WHERE id = ? AND user_id = ?',
            [title, amount, type, frequency, next_date, active, id, userId]
        );

        const [updated] = await db.query('SELECT * FROM recurring WHERE id = ?', [id]);
        res.json({ status: 'success', data: updated[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const deleteRecurring = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await db.query('DELETE FROM recurring WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Recurring transaction not found' });
        }

        res.json({ status: 'success', message: 'Recurring transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Process recurring transactions: Check if any tasks are due and add them to transactions table
const processRecurring = async (userId) => {
    try {
        const today = moment().format('YYYY-MM-DD');
        const [dueRecurring] = await db.query(
            'SELECT * FROM recurring WHERE user_id = ? AND active = TRUE AND next_date <= ?',
            [userId, today]
        );

        for (const item of dueRecurring) {
            // Find a default category for the type if not specified (though schema doesn't have category_id in recurring)
            // For now, we'll use a generic "Miscellaneous" category or similar. 
            // Better: Prompt user to select category, but "auto-added" implies automation.
            // Let's find the 'Miscellaneous' category for this user or global.
            const [categories] = await db.query(
                "SELECT id FROM categories WHERE (user_id = ? OR user_id IS NULL) AND name = 'Miscellaneous' LIMIT 1",
                [userId]
            );
            const categoryId = categories.length > 0 ? categories[0].id : 1; // Fallback to id 1

            // Add to transactions
            await db.query(
                'INSERT INTO transactions (user_id, category_id, title, amount, type, date, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, categoryId, item.title, item.amount, item.type, item.next_date, 'Recurring']
            );

            // Calculate next date based on frequency
            let nextDate = moment(item.next_date);
            if (item.frequency === 'daily') nextDate.add(1, 'days');
            else if (item.frequency === 'weekly') nextDate.add(1, 'weeks');
            else if (item.frequency === 'monthly') nextDate.add(1, 'months');
            else if (item.frequency === 'yearly') nextDate.add(1, 'years');

            // Update recurring item
            await db.query(
                'UPDATE recurring SET next_date = ? WHERE id = ?',
                [nextDate.format('YYYY-MM-DD'), item.id]
            );
        }
    } catch (error) {
        console.error("Error processing recurring transactions:", error);
    }
};

module.exports = {
    getAllRecurring,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    processRecurring
};
