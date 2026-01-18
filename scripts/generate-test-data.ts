import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Generating Norwegian test data...");

    // Find some user to own these events
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found. Please register a user first.");
        return;
    }

    const eventTypes = [
        { name: "Ola og Karis Bryllup", type: "WEDDING", slug: "ola-kari-bryllup", budgetGoal: 150000 },
        { name: "Lille Amandes Dåp", type: "CHRISTENING", slug: "amande-daap", budgetGoal: 20000 },
        { name: "Eriks Navnefest", type: "NAMING_CEREMONY", slug: "erik-navnefest", budgetGoal: 15000 },
        { name: "Sofies Konfirmasjon", type: "CONFIRMATION", slug: "sofie-konf", budgetGoal: 40000 },
        { name: "Bestefars 80-årsdag", type: "JUBILEE", slug: "bestefar-80", budgetGoal: 30000 },
    ];

    for (const et of eventTypes) {
        console.log(`Creating event: ${et.name}`);
        const event = await prisma.event.upsert({
            where: { slug: et.slug },
            update: {},
            create: {
                name: et.name,
                type: et.type as any,
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * Math.random() * 10), // Random date in future
                slug: et.slug,
                budgetGoal: et.budgetGoal,
                users: { connect: { id: user.id } },
            },
        });

        // Add some guests
        const guestNames = ["Harald Hansen", "Sonja Pedersen", "Morten Mo", "Ingrid Iversen", "Geir Gulliksen"];
        for (const name of guestNames) {
            await prisma.guest.create({
                data: {
                    eventId: event.id,
                    name,
                    type: "DINNER",
                    rsvpStatus: "PENDING",
                },
            });
        }

        // Add some wishlist items
        const wishes = ["Gavekort", "Kaffemaskin", "Sengetøy", "Sykkel"];
        for (const title of wishes) {
            await prisma.wishlistItem.create({
                data: {
                    eventId: event.id,
                    title,
                    description: "En hyggelig gave",
                },
            });
        }

        // Add some budget items
        const budgetItems = [
            { description: "Lokale", category: "Lokale", estimatedCost: et.budgetGoal * 0.3 },
            { description: "Catering", category: "Mat & Drikke", estimatedCost: et.budgetGoal * 0.4 },
        ];
        for (const item of budgetItems) {
            await prisma.budgetItem.create({
                data: {
                    eventId: event.id,
                    ...item,
                },
            });
        }
    }

    console.log("Test data generation complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
