import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const [guests, items, songs, tables] = await Promise.all([
        prisma.guest.findMany({ include: { table: true, partner: true } }),
        prisma.wishlistItem.findMany(),
        prisma.songRequest.findMany(),
        prisma.table.findMany({ include: { guests: true } }),
    ]);

    return (
        <AdminDashboard
            guests={guests}
            items={items}
            songs={songs}
            tables={tables}
        />
    );
}
