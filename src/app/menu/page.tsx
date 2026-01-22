import { prisma } from "@/lib/prisma";
import styles from "./menu.module.css";
import Link from "next/link";
import { ChevronLeft, UtensilsCrossed } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangement funnet.</div>;
    }

    // Check if menu is visible to guests
    const config = event.config as any;
    if (config?.menuVisible === false) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <UtensilsCrossed size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Meny utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Menyen er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const settings = event.settings as any;
    const menuContent = settings?.menuContent || "";

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href=".." className={styles.backLink}>
                    <ChevronLeft size={20} />
                    <span>Tilbake</span>
                </Link>
            </nav>

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <UtensilsCrossed size={40} className={styles.mainIcon} />
                    </div>
                    <h1 className="title-gradient">Meny</h1>
                    <p className={styles.intro}>
                        Smak på hva som venter deg
                    </p>
                </header>

                <section className={`${styles.content} glass`}>
                    {!menuContent ? (
                        <p className={styles.empty}>Menyen kommer snart!</p>
                    ) : (
                        <div className={styles.menuText}>
                            {menuContent}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
