const db = require('../config/db');

const admin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Not authorized' });
        }

        // Check if role is in token, if not (old token), check database
        let role = req.user.role;

        if (!role) {
            const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
            if (users.length > 0) {
                role = users[0].role;
            }
        }

        if (role === 'admin') {
            next();
        } else {
            res.status(403).json({ status: 'error', message: 'Access denied. Admin only.' });
        }
    } catch (error) {
        console.error("ADMIN_MW_ERR:", error);
        res.status(500).json({ status: 'error', message: 'Server error check permissions' });
    }
};

module.exports = { admin };
