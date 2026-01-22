const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is missing in environment!');
    process.exit(1);
}
console.log('DATABASE_URL length:', connectionString.length);
console.log('DATABASE_URL starts with:', connectionString.substring(0, 15));

async function main() {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Testing connection...');
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Connection successful, result:', result);

        const eventCount = await prisma.event.count();
        console.log('Event count:', eventCount);
    } catch (e) {
        console.error('--- FULL PRISMA ERROR ---');
        console.dir(e, { depth: null });
        if (e.cause) {
            console.error('--- ERROR CAUSE ---');
            console.dir(e.cause, { depth: null });
        }
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Script Fatal Error:', err);
});
