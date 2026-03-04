
import 'dotenv/config';
import { prisma } from "../src/lib/prisma";
import "../src/app/actions";

async function main() {
    console.log("Testing Prisma Client...");
    try {
        const userEmail = "testbrudeparet@example.com";
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        console.log("✅ Prisma Connected! User found:", user);
    } catch (err) {
        console.error("❌ Prisma Failed:", err);
    }
}

main();
