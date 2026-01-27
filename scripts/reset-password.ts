import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = "events@noker.se";
    const newPassword = "password123";

    console.log(`Resetting password for ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                isActivated: true
            },
        });
        console.log("Success! Password reset for:", user.email);
    } catch (error: any) {
        console.error("Error resetting password:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
