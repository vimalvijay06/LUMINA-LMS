const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
    try {
        const totalBooksResult = await pool.query('SELECT COUNT(*) FROM books');
        const totalBooks = parseInt(totalBooksResult.rows[0].count);

        const totalMembersResult = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND status = $2', ['MEMBER', 'ACTIVE']);
        const totalMembers = parseInt(totalMembersResult.rows[0].count);

        const issuedBooksResult = await pool.query('SELECT COUNT(*) FROM books WHERE status = $1', ['ISSUED']);
        const issuedBooks = parseInt(issuedBooksResult.rows[0].count);
        
        // Calculate overdue
        const overdueResult = await pool.query('SELECT COUNT(*) FROM books WHERE status = $1 AND due_date < NOW()', ['ISSUED']);
        const overdueBooks = parseInt(overdueResult.rows[0].count);

        res.json({
            totalBooks,
            totalMembers,
            issuedBooks,
            overdueBooks
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
