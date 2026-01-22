const { Client } = require('pg');

async function fixDb() {
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

        console.log('Terminating connections to wedding_db...');
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'wedding_db'
              AND pid <> pg_backend_pid();
        `);

        console.log('Dropping empty wedding_db...');
        await client.query('DROP DATABASE IF EXISTS wedding_db');

        console.log('Terminating connections to eventplanner_db...');
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'eventplanner_db'
              AND pid <> pg_backend_pid();
        `);

        console.log('Renaming eventplanner_db to wedding_db...');
        await client.query('ALTER DATABASE eventplanner_db RENAME TO wedding_db');

        console.log('Database fix successful!');
    } catch (err) {
        console.error('Fix failed:', err.message);
    } finally {
        await client.end();
    }
}

fixDb();
