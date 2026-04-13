const bcrypt = require('bcryptjs');
const db = require('./backend/config/db');

async function updateAdmin() {
    const newEmail = 'rikansh@gmail.com';
    const newPassword = 'Starlight';
    const oldEmail = 'admin@gmail.com';

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await db.query(
            'UPDATE users SET email = ?, password = ? WHERE email = ?',
            [newEmail, hashedPassword, oldEmail]
        );

        if (result.affectedRows > 0) {
            console.log('Admin credentials updated successfully!');
        } else {
            console.log('Admin user not found with that email.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error updating admin:', error);
        process.exit(1);
    }
}

updateAdmin();
