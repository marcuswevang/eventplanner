import { prisma } from "@/lib/prisma";
import BudgetManager from "@/components/BudgetManager";
import styles from "../admin.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangement funnet. Vennligst se dashbordet først.</div>;
    }

    const budgetItems = await prisma.budgetItem.findMany({
        where: { eventId: event.id },
        orderBy: { category: "asc" }
    });

    return (
        <div className={styles.container}>
            <main className={styles.main} style={{ marginLeft: 0 }}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/admin" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1>Budsjettstyring</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Oversikt over alle bryllupsutgifter</p>
                        </div>
                    </div>
                </header>

                <BudgetManager
                    eventId={event.id}
                    initialItems={budgetItems as any}
                    initialBudgetGoal={(event as any).budgetGoal || 0}
                    initialConfig={event.config as any}
                />
            </main>
        </div>
    );
}
