import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // Get the first event (assuming single-event system for now)
    let event = await prisma.event.findFirst();

    // If no event exists, create a default one
    if (!event) {
        event = await prisma.event.create({
            data: {
                name: "Mitt Bryllup",
                slug: "mitt-bryllup",
                date: new Date("2026-08-15"),
                type: "WEDDING"
            }
        });
    }

    const [guests, items, songs, tables, budgetItems] = await Promise.all([
        prisma.guest.findMany({ include: { table: true, partner: true } }),
        prisma.wishlistItem.findMany({ where: { eventId: event.id } }),
        prisma.songRequest.findMany({ where: { eventId: event.id } }),
        prisma.table.findMany({ where: { eventId: event.id }, include: { guests: true } }),
        prisma.budgetItem.findMany({ where: { eventId: event.id }, orderBy: { category: "asc" } })
    ]);

    return (
        <AdminDashboard
            eventId={event.id}
            guests={guests}
            items={items}
            songs={songs}
            tables={tables}
            budgetItems={budgetItems as any}
            budgetGoal={(event as any).budgetGoal || 0}
            config={event.config as any}
            eventSettings={event.settings as any}
        />
    );
}
