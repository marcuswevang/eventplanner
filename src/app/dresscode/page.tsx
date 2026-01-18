import { prisma } from "@/lib/prisma";
import styles from "./dresscode.module.css";
import Link from "next/link";
import { ChevronLeft, Shirt } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DresscodePage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangement funnet.</div>;
    }

    // Check if dresscode is visible to guests
    const config = event.config as any;
    if (config?.dresscodeVisible === false) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <Shirt size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Dresscode utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Dresscode-informasjon er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const settings = event.settings as any;
    const dresscodeContent = settings?.dresscodeContent || "";

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
                        <Shirt size={40} className={styles.mainIcon} />
                    </div>
                    <h1 className="title-gradient">Dresscode</h1>
                    <p className={styles.intro}>
                        Tips til hva du kan ha på deg
                    </p>
                </header>

                <section className={`${styles.content} glass`}>
                    {!dresscodeContent ? (
                        <p className={styles.empty}>Dresscode-informasjon kommer snart!</p>
                    ) : (
                        <div className={styles.dresscodeText}>
                            {dresscodeContent}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
