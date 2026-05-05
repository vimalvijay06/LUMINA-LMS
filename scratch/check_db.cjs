const pool = require('../backend/db');

async function check() {
    try {
        const res = await pool.query('SELECT id, title, status, issued_to_id FROM books');
        console.log('--- BOOKS IN DATABASE ---');
        console.table(res.rows);
        
        const users = await pool.query('SELECT id, name FROM users');
        console.log('--- USERS IN DATABASE ---');
        console.table(users.rows);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
