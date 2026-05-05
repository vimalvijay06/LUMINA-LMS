const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, status, photo_url as "photoUrl", phone, address, aadhaar, fines_owed as "finesOwed", joined_date as "joinedDate" FROM users WHERE role = $1', ['MEMBER']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const result = await pool.query('SELECT id, name, email, role, status, photo_url as "photoUrl", phone, address, aadhaar, fines_owed as "finesOwed", joined_date as "joinedDate" FROM users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/register', async (req, res) => {
    const { name, email, password, phone, address, aadhaar, referenceId } = req.body;
    try {
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'Email already exists' });
        
        if (aadhaar) {
            const aadhaarCheck = await pool.query('SELECT id FROM users WHERE aadhaar = $1', [aadhaar]);
            if (aadhaarCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'Aadhaar already registered' });
        }

        if (referenceId) {
            const refCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND status = $2', [referenceId, 'ACTIVE']);
            if (refCheck.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid Reference ID' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newId = 'M' + String(Date.now()).slice(-5);
        const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        await pool.query(`
            INSERT INTO users (id, name, email, password, phone, address, aadhaar, role, status, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [newId, name, email, hashedPassword, phone, address, aadhaar, 'MEMBER', 'PENDING', photoUrl]);

        res.json({ success: true, message: 'Application submitted' });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.post('/register-admin', async (req, res) => {
    const { name, email, password, phone, branch, district, librarianId, adminSecret } = req.body;
    try {
        if (adminSecret !== 'LUMINA2026') {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Secret Key' });
        }

        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newId = 'A' + String(Date.now()).slice(-5);
        const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

        await pool.query(`
            INSERT INTO users (id, name, email, password, phone, address, role, status, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [newId, name, email, hashedPassword, phone, `${branch}, ${district}`, 'ADMIN', 'ACTIVE', photoUrl]);

        res.json({ success: true, message: 'Admin Registration Successful!' });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/approve/:id', protect, admin, async (req, res) => {
    try {
        const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status, photo_url as "photoUrl"', ['ACTIVE', req.params.id]);
        res.json({ success: true, user: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/clear-fine', protect, admin, async (req, res) => {
    try {
        const result = await pool.query('UPDATE users SET fines_owed = 0 WHERE id = $1 RETURNING id, name, email, role, status, photo_url as "photoUrl"', [req.params.id]);
        res.json({ success: true, user: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id', protect, async (req, res) => {
    const { name, phone, address, photoUrl } = req.body;
    try {
        if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const result = await pool.query(`
            UPDATE users SET name = $1, phone = $2, address = $3, photo_url = $4
            WHERE id = $5 RETURNING id, name, email, role, status, photo_url as "photoUrl"
        `, [name, phone, address, photoUrl, req.params.id]);
        res.json({ success: true, user: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
