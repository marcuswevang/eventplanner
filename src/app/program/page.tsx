import { prisma } from "@/lib/prisma";
import styles from "./program.module.css";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export const dynamic = 'force-dynamic';

export default async function ProgramPage({
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

    // Check if program is visible to guests
    const isShowing = settings.landingPage?.showProgram !== false;
    if (!isShowing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <Calendar size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Program utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Programmet er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const isProtected = settings.landingPage?.protectedProgram === true;
    const isAuthenticated = await checkEventAuth(eventId);

    const programContent = settings?.programContent || "";
    const programLines = programContent.split('\n').filter((line: string) => line.trim());

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
                            <Calendar size={40} className={styles.mainIcon} />
                        </div>
                        <h1 className="title-gradient">Program</h1>
                        <p className={styles.intro}>
                            Her er tidsskjemaet for dagen - vi gleder oss til å feire med dere!
                        </p>
                    </header>

                    <section className={`${styles.timeline} glass`}>
                        {programLines.length === 0 ? (
                            <p className={styles.empty}>Programmet kommer snart!</p>
                        ) : (
                            <div className={styles.list}>
                                {programLines.map((line: string, idx: number) => {
                                    // Try to parse time from line (e.g., "14:00 - Vielse")
                                    const match = line.match(/^(\d{1,2}[:.]\d{2})\s*[-–]\s*(.+)$/);
                                    const time = match ? match[1] : null;
                                    const description = match ? match[2] : line;

                                    return (
                                        <div key={idx} className={styles.item}>
                                            {time && (
                                                <div className={styles.time}>
                                                    <Clock size={14} />
                                                    <span>{time}</span>
                                                </div>
                                            )}
                                            <p className={styles.description}>{description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
