
import 'dotenv/config';
import { Pool } from 'pg';

async function testConnection() {
    console.log("Testing PG connection...");
    console.log("URL:", process.env.DATABASE_URL);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const client = await pool.connect();
        console.log("✅ Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0]);
        client.release();
    } catch (err) {
        console.error("❌ Connection failed:", err);
    } finally {
        await pool.end();
    }
}

testConnection();
