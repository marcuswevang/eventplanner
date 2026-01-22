const { Client } = require('pg');

async function renameDb() {
    const config = {
        user: 'wedding_user',
        host: 'localhost',
        database: 'postgres',
        password: 'wedding_pass',
        port: 5433,
    };

    const client = new Client(config);

    try {
        await client.connect();

        // Check if wedding_db already exists
        const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'wedding_db'");
        if (checkRes.rows.length > 0) {
            console.log('wedding_db already exists.');
        } else {
            console.log('Renaming eventplanner_db to wedding_db...');
            // Kill connections to eventplanner_db
            await client.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = 'eventplanner_db'
                  AND pid <> pg_backend_pid();
            `);

            await client.query('ALTER DATABASE eventplanner_db RENAME TO wedding_db');
            console.log('Rename successful!');
        }
    } catch (err) {
        console.error('Rename failed:', err.message);
    } finally {
        await client.end();
    }
}

renameDb();
