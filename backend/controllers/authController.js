const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ status: 'error', message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
        }

        // 7-day expiry including role
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            status: 'success',
            message: 'Logged in successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                currency: user.currency,
                monthly_budget: user.monthly_budget,
                role: user.role
            },
            token // Also sending token in response body just in case frontend needs it
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ status: 'success', message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, avatar, currency, monthly_budget, role FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.json({ status: 'success', data: users[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe
};
