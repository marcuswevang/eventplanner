
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
            },
        });
        console.log("Success! Password updated for user:", user.email);
    } catch (error) {
        console.error("Error updating user password.");
        console.error(error);
        const users = await prisma.user.findMany();
        console.log("Existing users:", users.map(u => u.email));
    } finally {
        await prisma.$disconnect();
    }
}

main();
