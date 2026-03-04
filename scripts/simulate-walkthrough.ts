
import 'dotenv/config';
import { prisma } from "../src/lib/prisma";

async function runWalkthrough() {
    console.log("🚀 Starting Full Application Walkthrough Simulation...");
    console.log("DEBUG: DATABASE_URL =", process.env.DATABASE_URL);
    await prisma.$connect();

    // 1. Create User
    const userEmail = "testbrudeparet@example.com";
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: userEmail,
                password: "hashed_password_example_123",
                name: "Test Bruker",
                isActivated: true
            }
        });
        console.log("✅ Created Test User");
    }

    // 2. Create Event
    console.log("📝 Simulating Onboarding Wizard...");
    const eventSlug = "ola-kari-2026";

    // Clean up existing
    const existing = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (existing) {
        // Delete guests first due to strict relations? Cascade should handle it but safer to clear if needed
        // Prisma schema says onDelete: Cascade, so deleting event is enough
        await prisma.event.delete({ where: { id: existing.id } });
        console.log("🗑️ Deleted existing test event");
    }

    const eventData = {
        type: "WEDDING" as const,
        name: "Ola & Kari sitt Bryllup",
        date: new Date("2026-06-20"),
        slug: eventSlug,
        config: {
            budgetEnabled: true,
            wishlistEnabled: true,
            guestsEnabled: true,
            seatingEnabled: true,
            galleryEnabled: true,
        },
        settings: {
            landingPage: {
                bride: "Kari Nordmann",
                groom: "Ola Nordmann",
                toastmaster: "Espen Askeladd"
            }
        },
        isActive: true
    };

    const event = await prisma.event.create({
        data: {
            ...eventData,
            users: {
                connect: { id: user.id }
            }
        }
    });

    console.log(`✅ Event Created: ${event.name} (ID: ${event.id})`);

    // Add guests for roles
    await prisma.guest.createMany({
        data: [
            // Main Roles
            { eventId: event.id, name: "Kari Nordmann", role: "Brud", type: "DINNER", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Ola Nordmann", role: "Brudgom", type: "DINNER", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Espen Askeladd", role: "Toastmaster", type: "DINNER", rsvpStatus: "ACCEPTED", hasSpeech: true },

            // Forlovere
            { eventId: event.id, name: "Lisa", role: "Forlover (Brud)", type: "DINNER", rsvpStatus: "ACCEPTED", hasSpeech: true },
            { eventId: event.id, name: "Anna", role: "Forlover (Brud)", type: "DINNER", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Per", role: "Forlover (Brudgom)", type: "DINNER", rsvpStatus: "ACCEPTED", hasSpeech: true },
            { eventId: event.id, name: "Pål", role: "Forlover (Brudgom)", type: "DINNER", rsvpStatus: "ACCEPTED" },

            // Family with Allergies
            { eventId: event.id, name: "Tante Berit", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Gluten, Laktose" },
            { eventId: event.id, name: "Onkel Kåre", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Skalldyr" },
            { eventId: event.id, name: "Bestemor Olga", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Nøtter" },
            { eventId: event.id, name: "Lille Ole", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Egg, Melk, Soya" },

            // Friends
            { eventId: event.id, name: "Jens", type: "PARTY", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Marte", type: "PARTY", rsvpStatus: "ACCEPTED", allergies: "Vegetarianer" },
            { eventId: event.id, name: "Henrik", type: "PARTY", rsvpStatus: "PENDING" },
            { eventId: event.id, name: "Sofie", type: "DINNER", rsvpStatus: "DECLINED" },

            // More Guests
            { eventId: event.id, name: "Svein", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Veganer" },
            { eventId: event.id, name: "Ingrid", type: "DINNER", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Thomas", type: "DINNER", rsvpStatus: "ACCEPTED" },
            { eventId: event.id, name: "Maria", type: "DINNER", rsvpStatus: "ACCEPTED", allergies: "Fisk" },
        ]
    });
    console.log("✅ Added varied guest list with allergies");

    // 3. Update Settings (Simulating Admin Dashboard Edits)
    console.log("⚙️ Simulating Admin Settings Updates...");

    // Merge existing settings with new updates
    const currentSettings = (event.settings as any) || {};

    const updates = {
        ...currentSettings,
        landingPage: {
            ...currentSettings.landingPage,
            titleNames: "Kari & Ola",
            welcomeText: "Velkommen til vår store dag!",
            verticalOffset: 15,
            showRsvp: true,
            showMenu: true,
            showProgram: true,
            showDresscode: true,
            showLocation: true,
            showInfo: true,
            protectedRsvp: false
        },
        programContent: "13:00 - Vielse i Fjellkirken\n15:00 - Mottakelse på Høyfjellshotellet\n18:00 - Middag\n22:00 - Dans og fest",
        ceremonyName: "Fjellkirken",
        ceremonyAddress: "Fjellveien 1, 1234 Fjellbygda",
        ceremonyTime: "13:00",
        dinnerName: "Høyfjellshotellet",
        dinnerAddress: "Dalveien 10, 1234 Fjellbygda",
        dinnerTime: "18:00",
        partyName: "Høyfjellshotellet - Storsalen",
        partyAddress: "Dalveien 10, 1234 Fjellbygda",
        partyTime: "22:00",
        menuContent: "Forrett: Røkt laks\nHovedrett: Reinsdyrfilet\nDessert: Multekrem",
        dresscodeContent: "Mørk dress / Smoking",
        toastmasterName: "Espen Askeladd",
        toastmasterPhone: "900 00 000",
        maidOfHonor1Name: "Lisa",
        maidOfHonor1Phone: "911 11 111",
        bestMan1Name: "Per",
        bestMan1Phone: "922 22 222",
        instagramHashtag: "#olaogkari2026"
    };

    const updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: { settings: updates }
    });

    console.log("✅ Settings Updated with Norwegian Data");

    // 4. Verification Check
    const s = updatedEvent.settings as any;

    console.log("\n--- 🔍 VERIFICATION REPORT ---");
    console.log(`Event Name: ${updatedEvent.name}`);
    console.log(`Slug: ${updatedEvent.slug}`);
    console.log(`Locations Configured:`);
    console.log(` - Ceremony: ${s.ceremonyName} @ ${s.ceremonyTime}`);
    console.log(` - Dinner: ${s.dinnerName} @ ${s.dinnerTime}`);
    console.log(` - Party: ${s.partyName} @ ${s.partyTime}`);
    console.log(`\nInfo Page Data:`);
    console.log(` - Toastmaster: ${s.toastmasterName}`);
    console.log(` - Hashtag: ${s.instagramHashtag}`);
    console.log("\n🚀 Walkthrough Simulation Complete!");
}

runWalkthrough()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
