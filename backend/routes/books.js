const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, admin } = require('../middleware/auth');

const ISSUE_DAYS = 14;
const FINE_PER_DAY = 10;

router.get('/', protect, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, author, isbn, category, status, cover_url as "coverUrl", location, issued_to_id as "issuedToId", due_date as "dueDate", waitlist FROM books');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, author, isbn, category, coverUrl, location } = req.body;
        const newId = 'B' + Date.now();
        const result = await pool.query(`
            INSERT INTO books (id, title, author, isbn, category, cover_url, location, status, waitlist)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [newId, title, author, isbn, category, coverUrl, JSON.stringify(location || {}), 'AVAILABLE', JSON.stringify([])]);
        
        res.status(201).json({ success: true, book: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.post('/:id/issue', protect, admin, async (req, res) => {
    const { userId } = req.body;
    try {
        const bookCheck = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

        if (bookCheck.rows.length === 0 || userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid Book or Member' });
        }
        
        const book = bookCheck.rows[0];
        if (book.status !== 'AVAILABLE' && !(book.status === 'RESERVED' && book.issued_to_id === userId)) {
            return res.status(400).json({ success: false, message: `Book is ${book.status}` });
        }

        const countResult = await pool.query("SELECT COUNT(*) FROM books WHERE issued_to_id = $1 AND status IN ('ISSUED', 'RESERVED')", [userId]);
        const currentlyIssued = parseInt(countResult.rows[0].count);

        if (currentlyIssued >= 3 && book.issued_to_id !== userId) {
            return res.status(400).json({ success: false, message: 'Member reached issue limit (3 books)' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + ISSUE_DAYS);

        const result = await pool.query(`
            UPDATE books SET status = 'ISSUED', issued_to_id = $1, due_date = $2 WHERE id = $3 RETURNING *
        `, [userId, dueDate, book.id]);
        
        res.json({ success: true, book: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/return', protect, admin, async (req, res) => {
    try {
        const bookCheck = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        
        const book = bookCheck.rows[0];
        if (book.status !== 'ISSUED') return res.status(400).json({ success: false, message: 'Book not issued' });

        const userId = book.issued_to_id;
        let fineAmount = 0;

        if (book.due_date) {
            const today = new Date(); today.setHours(0,0,0,0);
            const due = new Date(book.due_date); due.setHours(0,0,0,0);
            if (today > due) {
                const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
                fineAmount = diffDays * FINE_PER_DAY;
            }
        }

        if (fineAmount > 0 && userId) {
            await pool.query('UPDATE users SET fines_owed = fines_owed + $1 WHERE id = $2', [fineAmount, userId]);
        }

        let newStatus = 'AVAILABLE';
        let newIssuedTo = null;
        let newDueDate = null;
        let waitlist = book.waitlist || [];

        if (waitlist.length > 0) {
            newIssuedTo = waitlist[0];
            waitlist = waitlist.slice(1);
            newStatus = 'RESERVED';
            const resDate = new Date(); resDate.setDate(resDate.getDate() + 2);
            newDueDate = resDate;
        }

        const result = await pool.query(`
            UPDATE books SET status = $1, issued_to_id = $2, due_date = $3, waitlist = $4 WHERE id = $5 RETURNING *
        `, [newStatus, newIssuedTo, newDueDate, JSON.stringify(waitlist), book.id]);

        res.json({ success: true, fine: fineAmount, book: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id', protect, admin, async (req, res) => {
    try {
        const { title, author, isbn, category, status } = req.body;
        const result = await pool.query(`
            UPDATE books SET title = COALESCE($1, title), author = COALESCE($2, author), isbn = COALESCE($3, isbn), category = COALESCE($4, category), status = COALESCE($5, status) WHERE id = $6 RETURNING *
        `, [title, author, isbn, category, status, req.params.id]);
        res.json({ success: true, book: result.rows[0] });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const bookCheck = await pool.query('SELECT status FROM books WHERE id = $1', [req.params.id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        if (bookCheck.rows[0].status === 'ISSUED') return res.status(400).json({ success: false, message: 'Cannot delete: Book is issued.' });
        
        await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/reserve', protect, async (req, res) => {
    const { userId } = req.body;
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    
    try {
        const bookCheck = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        const book = bookCheck.rows[0];

        if (book.status === 'AVAILABLE') {
            const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
            await pool.query(`UPDATE books SET status = 'RESERVED', issued_to_id = $1, due_date = $2 WHERE id = $3`, [userId, dueDate, book.id]);
            return res.json({ success: true, message: 'Reserved for 2 days.' });
        }

        let waitlist = book.waitlist || [];
        if (!waitlist.includes(userId)) {
            waitlist.push(userId);
            await pool.query(`UPDATE books SET waitlist = $1 WHERE id = $2`, [JSON.stringify(waitlist), book.id]);
            return res.json({ success: true, message: 'Added to waitlist.' });
        }
        res.status(400).json({ success: false, message: 'Already in waitlist.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/renew', protect, async (req, res) => {
    try {
        const bookCheck = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        const book = bookCheck.rows[0];
        
        if (book.status !== 'ISSUED') return res.status(400).json({ success: false, message: 'Book not issued' });
        if (req.user.role !== 'ADMIN' && book.issued_to_id !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized renewal' });

        const newDueDate = new Date(book.due_date || new Date());
        newDueDate.setDate(newDueDate.getDate() + ISSUE_DAYS);

        const result = await pool.query('UPDATE books SET due_date = $1 WHERE id = $2 RETURNING *', [newDueDate, book.id]);
        res.json({ success: true, book: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/cancel-reservation', protect, async (req, res) => {
    try {
        const { userId } = req.body;
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const bookCheck = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        const book = bookCheck.rows[0];

        let waitlist = book.waitlist || [];
        const newWaitlist = waitlist.filter(id => id !== userId);

        let newStatus = book.status;
        let newIssuedTo = book.issued_to_id;
        let newDueDate = book.due_date;

        if (book.status === 'RESERVED' && book.issued_to_id === userId) {
            newStatus = 'AVAILABLE';
            newIssuedTo = null;
            newDueDate = null;

            if (newWaitlist.length > 0) {
                newIssuedTo = newWaitlist[0];
                newWaitlist.shift();
                newStatus = 'RESERVED';
                const resDate = new Date(); resDate.setDate(resDate.getDate() + 2);
                newDueDate = resDate;
            }
        }

        await pool.query(`
            UPDATE books SET status = $1, issued_to_id = $2, due_date = $3, waitlist = $4 WHERE id = $5
        `, [newStatus, newIssuedTo, newDueDate, JSON.stringify(newWaitlist), book.id]);

        res.json({ success: true, message: 'Reservation/Waitlist cancelled.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
