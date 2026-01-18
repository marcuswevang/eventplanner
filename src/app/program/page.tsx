import { prisma } from "@/lib/prisma";
import styles from "./program.module.css";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProgramPage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangement funnet.</div>;
    }

    // Check if program is visible to guests
    const config = event.config as any;
    if (config?.programVisible === false) {
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

    const settings = event.settings as any;
    const programContent = settings?.programContent || "";
    const programLines = programContent.split('\n').filter((line: string) => line.trim());

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
    );
}
