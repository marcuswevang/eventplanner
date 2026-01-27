import { prisma } from "@/lib/prisma";
import BudgetManager from "@/components/BudgetManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

export default async function BudgetPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user) {
        redirect("/login");
    }

    const eventId = params.eventId as string;

    if (!eventId) {
        redirect("/admin");
    }

    const eventItems = await prisma.budgetItem.findMany({
        where: { eventId },
        orderBy: { category: "asc" }
    });

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { budgetGoal: true, config: true }
    });

    if (!event) {
        redirect("/admin");
    }

    return (
        <div className={styles.container}>
            <AdminSidebar
                eventId={eventId}
                activeTab="budget"
                userId={(session.user as any).id}
                userRole={(session.user as any).role}
                config={event.config}
            />
            <main className={styles.main}>
                <div style={{ padding: '2rem' }}>
                    <header className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Link href={`/admin?eventId=${eventId}`} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                <ArrowLeft size={20} />
                                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Tilbake til Dashboard</span>
                            </Link>
                        </div>
                        <h1 style={{ margin: 0 }}>Budsjettstyring</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Hold kontroll på utgifter og betalinger.</p>
                    </header>

                    <BudgetManager
                        eventId={eventId}
                        initialItems={eventItems as any}
                        initialBudgetGoal={event?.budgetGoal || 0}
                        initialConfig={event?.config as any}
                    />
                </div>
            </main>
        </div>
    );
}
