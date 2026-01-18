import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "events@noker.se";
    console.log(`Setting ${email} as SUPER_ADMIN...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: "SUPER_ADMIN",
                isActivated: true,
            },
        });
        console.log("Success! User updated:", user);
    } catch (error) {
        console.error("Error updating user. Make sure the user exists first (register via UI).");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
