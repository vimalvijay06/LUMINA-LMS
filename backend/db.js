const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL ERROR: DATABASE_URL is not defined in environment variables!');
    process.exit(1);
}

let config;
try {
    config = parse(process.env.DATABASE_URL);
    config.password = String(config.password);
} catch (err) {
    console.error('❌ CRITICAL ERROR: Failed to parse DATABASE_URL. Please check the format.', err.message);
    process.exit(1);
}

const pool = new Pool(config);

module.exports = pool;
