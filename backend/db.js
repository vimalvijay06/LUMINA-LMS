const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const dotenv = require('dotenv');
dotenv.config();

const config = parse(process.env.DATABASE_URL);
config.password = String(config.password);

const pool = new Pool(config);

module.exports = pool;
