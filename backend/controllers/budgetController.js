const db = require('../config/db');

const getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        let query = 'SELECT b.*, c.name as category_name, c.color FROM budgets b JOIN categories c ON b.category_id = c.id WHERE b.user_id = ?';
        const queryParams = [userId];

        if (month && year) {
            query += ' AND b.month = ? AND b.year = ?';
            queryParams.push(month, year);
        }

        const [budgets] = await db.query(query, queryParams);

        // Also fetch spent amounts for these budgets
        const spentQuery = `
            SELECT category_id, SUM(amount) as spent 
            FROM transactions 
            WHERE user_id = ? AND type = 'expense' AND MONTH(date) = ? AND YEAR(date) = ?
            GROUP BY category_id
        `;
        
        let monthFilter = month || new Date().getMonth() + 1;
        let yearFilter = year || new Date().getFullYear();

        const [spentData] = await db.query(spentQuery, [userId, monthFilter, yearFilter]);

        // Merge spent data
        const budgetsWithSpent = budgets.map(b => {
            const spentItem = spentData.find(s => s.category_id === b.category_id);
            return {
                ...b,
                spent: spentItem ? parseFloat(spentItem.spent) : 0
            };
        });

        res.json({ status: 'success', data: budgetsWithSpent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const createOrUpdateBudget = async (req, res) => {
    try {
        const { category_id, amount, month, year } = req.body;
        const userId = req.user.id;

        // Check if budget exists for this month/year/category
        const [existing] = await db.query(
            'SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?',
            [userId, category_id, month, year]
        );

        if (existing.length > 0) {
            // Update
            await db.query(
                'UPDATE budgets SET amount = ? WHERE id = ?',
                [amount, existing[0].id]
            );
        } else {
            // Create
            await db.query(
                'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
                [userId, category_id, amount, month, year]
            );
        }

        res.json({ status: 'success', message: 'Budget saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ status: 'success', message: 'Budget deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = {
    getBudgets,
    createOrUpdateBudget,
    deleteBudget
};
