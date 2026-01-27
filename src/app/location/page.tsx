import { prisma } from "@/lib/prisma";
import styles from "./location.module.css";
import Link from "next/link";
import { ChevronLeft, MapPin, ExternalLink, Church, UtensilsCrossed, PartyPopper } from "lucide-react";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export const dynamic = 'force-dynamic';

export default async function LocationPage({
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

    // Check if location is visible to guests
    const isShowing = settings.landingPage?.showLocation !== false;

    if (!isShowing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <MapPin size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Lokasjon utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Lokasjonsinformasjon er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const isProtected = settings.landingPage?.protectedLocation === true;
    const isAuthenticated = await checkEventAuth(eventId);

    // Multiple venues
    const venues = [
        {
            icon: Church,
            title: "Seremoni / Vielse",
            name: settings?.ceremonyName,
            address: settings?.ceremonyAddress,
            mapUrl: settings?.ceremonyMapUrl,
            time: settings?.ceremonyTime
        },
        {
            icon: UtensilsCrossed,
            title: "Middag",
            name: settings?.dinnerName,
            address: settings?.dinnerAddress,
            mapUrl: settings?.dinnerMapUrl,
            time: settings?.dinnerTime
        },
        {
            icon: PartyPopper,
            title: "Fest",
            name: settings?.partyName,
            address: settings?.partyAddress,
            mapUrl: settings?.partyMapUrl,
            time: settings?.partyTime
        }
    ].filter(v => v.name || v.address);

    const locationInfo = settings?.locationInfo || "";
    const hasContent = venues.length > 0 || locationInfo;

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
                            <MapPin size={40} className={styles.mainIcon} />
                        </div>
                        <h1 className="title-gradient">Lokasjoner</h1>
                        <p className={styles.intro}>
                            Her finner du oss på den store dagen
                        </p>
                    </header>

                    {!hasContent ? (
                        <section className={`${styles.content} glass`}>
                            <p className={styles.empty}>Lokasjonsinformasjon kommer snart!</p>
                        </section>
                    ) : (
                        <>
                            <section className={styles.venueGrid}>
                                {venues.map((venue, idx) => (
                                    <div key={idx} className={`${styles.venueCard} glass`}>
                                        <div className={styles.venueIcon}>
                                            <venue.icon size={24} />
                                        </div>
                                        <h3>{venue.title}</h3>
                                        {venue.time && <p style={{ color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.2rem' }}>kl. {venue.time}</p>}
                                        {venue.name && <h2 className={styles.venueName}>{venue.name}</h2>}
                                        {venue.address && <p className={styles.venueAddress}>{venue.address}</p>}
                                        {venue.mapUrl && (
                                            <a
                                                href={venue.mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.mapLink}
                                            >
                                                <ExternalLink size={14} />
                                                <span>Vis kart</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </section>

                            {locationInfo && (
                                <section className={`${styles.extraInfo} glass`}>
                                    <h3>Praktisk informasjon</h3>
                                    <p>{locationInfo}</p>
                                </section>
                            )}
                        </>
                    )}
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
