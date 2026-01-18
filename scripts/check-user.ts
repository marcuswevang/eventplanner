
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "events@noker.se";
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log("User status:", user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
