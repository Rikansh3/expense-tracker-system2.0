const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createAdmin() {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const name = 'Admin User';

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
