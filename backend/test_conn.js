const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_NwT1AHFkpf7s@ep-cool-mud-ao7h82b4.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

async function test() {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Time:", res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
