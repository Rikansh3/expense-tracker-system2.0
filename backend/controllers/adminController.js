const db = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ status: 'success', data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        if (!name || !email || !role) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }

        const [result] = await db.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.json({ status: 'success', message: 'User updated successfully' });
    } catch (error) {
        console.error("ADMIN_UPDATE_ERR:", error);
        res.status(500).json({ status: 'error', message: error.message || 'Server error during update' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (userId === req.user.id) {
        return res.status(400).json({ status: 'error', message: 'You cannot delete yourself!' });
    }

    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
        console.error("ADMIN_DELETE_ERR:", error);
        res.status(500).json({ status: 'error', message: 'Could not delete user. They might have active records.' });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser
};
