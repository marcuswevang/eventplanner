import { prisma } from "@/lib/prisma";
import styles from "./playlist.module.css";
import Link from "next/link";
import { ChevronLeft, Music } from "lucide-react";
import PlaylistClient from "./PlaylistClient";
import { getEventTerm } from "@/lib/terminology";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export const dynamic = 'force-dynamic';

export default async function PlaylistPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const eventIdParam = params.eventId as string;
    const event = await resolveEvent(eventIdParam);

    if (!event) {
        return <div>Ingen spilleliste funnet.</div>;
    }

    const eventId = event.id;
    const settings = (event.settings as any) || {};

    // Check if songs/playlist is visible to guests
    const isShowing = settings.landingPage?.showPlaylist !== false;
    if (!isShowing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <Music size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Spilleliste utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Låtønsker er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const isProtected = settings.landingPage?.protectedPlaylist === true;
    const isAuthenticated = await checkEventAuth(eventId);

    const term = getEventTerm(event.type);

    const requests = await prisma.songRequest.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
    });

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
                            <Music size={40} className={styles.mainIcon} />
                        </div>
                        <h1 className="title-gradient">{term}-spillelisten</h1>
                        <p className={styles.intro}>
                            Hvilken sang vil få deg ut på dansegulvet?
                            Legg til dine ønsker her så tar vi dem med til DJ-en!
                        </p>
                    </header>

                    <section className={styles.content}>
                        <div className={`${styles.formCard} glass`}>
                            <h3>Legg til sang</h3>
                            <PlaylistClient eventId={eventId} />
                        </div>

                        <div className={`${styles.listCard} glass`}>
                            <h3>Ønskede sanger ({requests.length})</h3>
                            <div className={styles.list}>
                                {requests.length === 0 ? (
                                    <p className={styles.empty}>Ingen sanger lagt til ennå. Vær den første!</p>
                                ) : (
                                    requests.map((req: any) => (
                                        <div key={req.id} className={styles.songItem}>
                                            <div className={styles.songInfo}>
                                                <span className={styles.songTitle}>{req.title}</span>
                                                <span className={styles.songArtist}>{req.artist}</span>
                                            </div>
                                            <span className={styles.requestedBy}>Ønsket av {req.requestedBy}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
