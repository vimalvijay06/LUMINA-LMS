const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM racks');
        const rackMap = {};
        result.rows.forEach(r => {
            rackMap[r.id] = { url: r.url, pins: r.pins || {} };
        });
        res.json(rackMap);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const { id, url, pins } = req.body;
    try {
        const check = await pool.query('SELECT id FROM racks WHERE id = $1', [id]);
        let result;
        if (check.rows.length > 0) {
            result = await pool.query('UPDATE racks SET url = $1, pins = $2 WHERE id = $3 RETURNING *', [url, JSON.stringify(pins || {}), id]);
        } else {
            result = await pool.query('INSERT INTO racks (id, url, pins) VALUES ($1, $2, $3) RETURNING *', [id, url, JSON.stringify(pins || {})]);
        }
        res.json({ success: true, rack: result.rows[0] });
    } catch (err) {
        res.status(200).json({ success: false, message: err.message });
    }
});

module.exports = router;
