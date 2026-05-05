const jwt = require('jsonwebtoken');
const pool = require('../db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const result = await pool.query('SELECT id, name, email, role, status, photo_url as "photoUrl", phone, address, aadhaar, fines_owed as "finesOwed", joined_date as "joinedDate" FROM users WHERE id = $1', [decoded.id]);
            
            if (result.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            req.user = result.rows[0];
            next();
        } catch (error) {
            console.error('JWT Verify Error:', error.message);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
