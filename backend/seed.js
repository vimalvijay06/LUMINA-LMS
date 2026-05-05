const pool = require('./db');
const bcrypt = require('bcryptjs');

const SEED_RACK_PHOTOS = [
    {
        id: 'R1',
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
        pins: JSON.stringify({ 'A': { x: 30, y: 40 }, 'B': { x: 30, y: 70 } })
    },
    {
        id: 'R2',
        url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800',
        pins: JSON.stringify({ 'A': { x: 50, y: 30 }, 'C': { x: 50, y: 60 } })
    },
    {
        id: 'R3',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
        pins: JSON.stringify({ 'D': { x: 40, y: 50 }, 'E': { x: 70, y: 50 } })
    }
];

const SEED_BOOKS = [
    {
        id: 'B001',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Classic',
        isbn: '978-0743273565',
        status: 'AVAILABLE',
        location: JSON.stringify({ rack: 'R1', shelf: 'A', section: 'Fiction' }),
        cover_url: 'https://placehold.co/150x200?text=Gatsby'
    },
    {
        id: 'B002',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'Technology',
        isbn: '978-0132350884',
        status: 'ISSUED',
        location: JSON.stringify({ rack: 'R3', shelf: 'D', section: 'CompSci' }),
        issued_to_id: 'M001',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cover_url: 'https://placehold.co/150x200?text=Clean+Code'
    },
    {
        id: 'B003',
        title: 'Data Structures using C',
        author: 'Reema Thareja',
        category: 'Technology',
        isbn: '978-0198099307',
        status: 'AVAILABLE',
        location: JSON.stringify({ rack: 'R3', shelf: 'E', section: 'CompSci' }),
        cover_url: 'https://placehold.co/150x200?text=DS+in+C'
    }
];

const seedDB = async () => {
    try {
        console.log('Connected to PostgreSQL. Rebuilding schema with Raw SQL...');

        // 1. Schema check
        console.log('Ensuring tables exist...');

        // 2. Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'MEMBER',
                status VARCHAR(20) DEFAULT 'PENDING',
                photo_url TEXT,
                phone VARCHAR(20),
                address TEXT,
                aadhaar VARCHAR(20) UNIQUE,
                fines_owed FLOAT DEFAULT 0,
                joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
 
            CREATE TABLE IF NOT EXISTS books (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(50),
                category VARCHAR(100),
                status VARCHAR(20) DEFAULT 'AVAILABLE',
                cover_url TEXT,
                location JSONB,
                issued_to_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
                due_date TIMESTAMP,
                waitlist JSONB DEFAULT '[]'::JSONB
            );
 
            CREATE TABLE IF NOT EXISTS racks (
                id VARCHAR(50) PRIMARY KEY,
                url TEXT NOT NULL,
                pins JSONB
            );
        `);

        // 3. Insert Admin
        const adminSalt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin', adminSalt);
        await pool.query(`
            INSERT INTO users (id, name, email, password, role, status, photo_url, fines_owed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, ['U001', 'Admin User', 'admin@library.com', adminPass, 'ADMIN', 'ACTIVE', 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff', 0]);

        // 4. Insert Member
        const memSalt = await bcrypt.genSalt(10);
        const memPass = await bcrypt.hash('user123', memSalt);
        await pool.query(`
            INSERT INTO users (id, name, email, password, role, status, photo_url, aadhaar, fines_owed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, ['M001', 'Vimal Kumar', 'vimal@example.com', memPass, 'MEMBER', 'ACTIVE', 'https://ui-avatars.com/api/?name=Vimal+Kumar&background=random', '123456789012', 0]);

        // 5. Insert Racks
        for (let rack of SEED_RACK_PHOTOS) {
            await pool.query('INSERT INTO racks (id, url, pins) VALUES ($1, $2, $3)', [rack.id, rack.url, rack.pins]);
        }

        // 6. Insert Books
        for (let book of SEED_BOOKS) {
            await pool.query(`
                INSERT INTO books (id, title, author, isbn, category, status, location, issued_to_id, due_date, cover_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [book.id, book.title, book.author, book.isbn, book.category, book.status, book.location, book.issued_to_id || null, book.due_date || null, book.cover_url]);
        }

        console.log('✅ PostgreSQL Schema Built & Seeded with RAW SQL!');
        process.exit();
    } catch (err) {
        console.error('❌ SQL Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
