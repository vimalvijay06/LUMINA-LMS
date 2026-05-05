const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim()]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.status === 'PENDING') {
                return res.status(200).json({ success: false, message: 'Account pending admin approval.' });
            }
            if (user.status === 'REJECTED') {
                return res.status(200).json({ success: false, message: 'Account was rejected.' });
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photoUrl: user.photo_url
                },
                token: generateToken(user.id)
            });
        } else {
            res.status(200).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

module.exports = router;
