import { prisma } from "@/lib/prisma";
import styles from "./menu.module.css";
import Link from "next/link";
import { ChevronLeft, UtensilsCrossed } from "lucide-react";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export const dynamic = 'force-dynamic';

export default async function MenuPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const eventIdParam = params.eventId as string;
    const event = await resolveEvent(eventIdParam);

    if (!event) {
        return <div>Ingen arrangement funnet.</div>;
    }

    const eventId = event.id;
    const settings = (event.settings as any) || {};

    // Check if menu is visible to guests
    const isShowing = settings.landingPage?.showMenu !== false;

    if (!isShowing) {
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

    const isProtected = settings.landingPage?.protectedMenu === true;
    const isAuthenticated = await checkEventAuth(eventId);

    const menuContent = settings?.menuContent || "";

    return (
        <GuestProtectionWrapper eventId={eventId} isInitiallyAuthenticated={isAuthenticated || !isProtected}>
            <div className={styles.container}>
                <nav className={styles.nav}>
                    <Link href={`/?eventId=${eventId}`} className={styles.backLink}>
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
        </GuestProtectionWrapper>
    );
}
