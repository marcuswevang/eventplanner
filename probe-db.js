const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Current DATABASE_URL:', connectionString);

async function probe() {
    // Try to connect to postgres system db first to list others
    const baseConfig = {
        user: 'wedding_user',
        host: 'localhost',
        database: 'postgres',
        password: 'wedding_pass',
        port: 5433,
    };

    const client = new Client(baseConfig);

    try {
        console.log('Connecting to postgres system db on port 5433...');
        await client.connect();
        console.log('Connected!');

        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Available databases:', res.rows.map(r => r.datname));

        for (const db of res.rows) {
            console.log(`\nChecking database: ${db.datname}`);
            const dbClient = new Client({ ...baseConfig, database: db.datname });
            try {
                await dbClient.connect();
                const tableRes = await dbClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                console.log(`Tables in ${db.datname}:`, tableRes.rows.map(t => t.table_name).join(', '));

                if (tableRes.rows.some(t => t.table_name === 'Event')) {
                    const eventRes = await dbClient.query('SELECT name FROM "Event"');
                    console.log(`Events in ${db.datname}:`, eventRes.rows.map(e => e.name).join(', '));
                }
            } catch (err) {
                console.log(`Could not connect to ${db.datname}:`, err.message);
            } finally {
                await dbClient.end();
            }
        }

    } catch (err) {
        console.error('Probe failed:', err.message);
    } finally {
        await client.end();
    }
}

probe();
