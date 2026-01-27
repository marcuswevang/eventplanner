import styles from "./rsvp.module.css";
import Link from "next/link";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export default async function RsvpPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const eventIdParam = params.eventId as string;
    const event = await resolveEvent(eventIdParam);

    if (!event) return <div>Event not found</div>;

    const eventId = event.id;
    const settings = (event.settings as any) || {};

    // Check if rsvp is visible to guests
    const isShowing = settings.landingPage?.showRsvp !== false;

    if (!isShowing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <ClipboardList size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Svar på invitasjon utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Svarskjemaet er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const isProtected = settings.landingPage?.protectedRsvp === true;
    const isAuthenticated = await checkEventAuth(eventId);

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
                        <h1 className="title-gradient">Svar på invitasjon</h1>
                        <p className={styles.intro}>Vi gleder oss til å høre fra deg!</p>
                    </header>

                    <section className={`${styles.card} glass`}>
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <ClipboardList size={48} style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                            <h3>Svar på invitasjon kommer snart</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                Vi jobber med å få på plass det digitale svarskjemaet.
                                Sjekk gjerne tilbake litt senere!
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
