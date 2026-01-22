import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    let eventId = params.eventId as string;

    // If no eventId is provided, get the first event the user is admin of
    if (!eventId) {
        const firstEvent = await prisma.event.findFirst({
            where: {
                users: { some: { id: userId } }
            }
        });

        if (firstEvent) {
            eventId = firstEvent.id;
        }
    }

    if (!eventId) {
        // Fallback or create default event if user has none and it's allowed
        // For standalone bryllup, we might want to ensure an event exists
        const anyEvent = await prisma.event.findFirst();
        if (anyEvent) {
            eventId = anyEvent.id;
        } else {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1 className="title-gradient">Velkommen til Bryllupsplanleggeren</h1>
                    <p>Du har ingen arrangementer ennå.</p>
                    <Link
                        href="/admin/new"
                        className="luxury-button"
                        style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}
                    >
                        Opprett ditt første arrangement
                    </Link>
                </div>
            );
        }
    }

    const [guests, items, songs, tables, galleryItems, budgetItems, event] = await Promise.all([
        prisma.guest.findMany({
            where: { eventId },
            include: { table: true, partner: true }
        }),
        prisma.wishlistItem.findMany({
            where: { eventId }
        }),
        prisma.songRequest.findMany({
            where: { eventId }
        }),
        prisma.table.findMany({
            where: { eventId },
            include: { guests: true }
        }),
        prisma.galleryItem.findMany({
            where: { eventId },
            orderBy: { createdAt: "desc" }
        }),
        prisma.budgetItem.findMany({
            where: { eventId },
            orderBy: { category: "asc" }
        }),
        prisma.event.findUnique({
            where: { id: eventId },
            include: { users: true }
        })
    ]);

    if (!event) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Arrangement ikke funnet.</div>;
    }

    const isSuperAdmin = (session.user as any).role === "SUPER_ADMIN";
    const isOwner = event.users.some(u => u.id === userId);

    if (!isSuperAdmin && !isOwner) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>Du har ikke tilgang til dette arrangementet.</div>;
    }

    return (
        <AdminDashboard
            eventId={event.id}
            userId={userId}
            guests={guests}
            items={items}
            songs={songs}
            tables={tables}
            galleryItems={galleryItems}
            budgetItems={budgetItems as any}
            budgetGoal={(event as any).budgetGoal || 0}
            config={event.config as any}
            eventSettings={event.settings as any}
            event={event}
            initialTab={params.tab as any}
        />
    );
}
