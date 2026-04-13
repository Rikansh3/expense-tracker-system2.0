const db = require('../config/db');

const getAllCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch categories that belong to the user or are global (user_id IS NULL)
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC',
            [userId]
        );
        res.json({ status: 'success', data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;
        const userId = req.user.id;

        const [result] = await db.query(
            'INSERT INTO categories (user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)',
            [userId, name, icon, color, type]
        );

        const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json({ status: 'success', data: newCategory[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color, type } = req.body;
        const userId = req.user.id;

        // Ensure user can only update their own categories
        const [existing] = await db.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Not authorized or category not found' });
        }

        await db.query(
            'UPDATE categories SET name = ?, icon = ?, color = ?, type = ? WHERE id = ? AND user_id = ?',
            [name, icon, color, type, id, userId]
        );

        const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        res.json({ status: 'success', data: updated[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify it belongs to user first
        const [check] = await db.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        if (check.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Category not found or you cannot delete default categories.' });
        }

        const [result] = await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ status: 'success', message: 'Category deleted successfully' });
    } catch (error) {
        console.error("CAT_DELETE_ERR:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Cannot delete category. Ensure no recurring transactions or other critical items are using it.' 
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
