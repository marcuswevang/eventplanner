import { prisma } from "@/lib/prisma";
import BudgetManager from "@/components/BudgetManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

    const items = await prisma.budgetItem.findMany({
        where: { eventId },
        orderBy: { category: "asc" }
    });

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Link href={`/admin?eventId=${eventId}`} style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 style={{ margin: 0 }}>Budsjettstyring</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Hold kontroll på utgifter og betalinger.</p>
            </header>

            <BudgetManager eventId={eventId} initialItems={items as any} />
        </main>
    );
}
