const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const dotenv = require('dotenv');
dotenv.config();

const useLocal = process.env.USE_LOCAL === 'true';
const dbUrl = useLocal ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL;

if (!dbUrl) {
    console.error(`❌ CRITICAL ERROR: ${useLocal ? 'LOCAL_DATABASE_URL' : 'DATABASE_URL'} is not defined!`);
    process.exit(1);
}

const config = parse(dbUrl);
config.password = String(config.password);

console.log(`📡 CONNECTION MODE: ${useLocal ? '🏠 LOCAL POSTGRES' : '☁️ NEON CLOUD'}`);
if (useLocal) console.log(`👉 Using URL: ${dbUrl}`);

const pool = new Pool(config);

module.exports = pool;
