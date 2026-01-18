import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // For now, get the first event found in the DB
    // In a future step, this will be based on user session/event switcher
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangementer funnet. Vennligst opprett et arrangement først.</div>;
    }

    const [guests, items, songs, tables] = await Promise.all([
        prisma.guest.findMany({
            where: { eventId: event.id },
            include: { table: true, partner: true }
        }),
        prisma.wishlistItem.findMany({
            where: { eventId: event.id }
        }),
        prisma.songRequest.findMany({
            where: { eventId: event.id }
        }),
        prisma.table.findMany({
            where: { eventId: event.id },
            include: { guests: true }
        }),
    ]);

    return (
        <AdminDashboard
            eventId={event.id}
            guests={guests}
            items={items}
            songs={songs}
            tables={tables}
        />
    );
}
