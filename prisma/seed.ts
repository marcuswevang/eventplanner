import { PrismaClient, UserRole, EventType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = "admin@example.com";
    const password = "password123"; // In real auth, this would be hashed

    // 1. Create Super Admin User
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            name: "Super Admin",
            role: UserRole.SUPER_ADMIN
        }
    });

    console.log({ user });

    // 2. Create Default Event
    const eventSlug = "demo-bryllup";
    const event = await prisma.event.upsert({
        where: { slug: eventSlug },
        update: {},
        create: {
            slug: eventSlug,
            name: "Vårt Bryllup",
            type: EventType.WEDDING,
            date: new Date("2026-06-20"),
            guestPassword: "gjest",
            users: {
                connect: { id: user.id }
            }
        }
    });

    console.log({ event });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
