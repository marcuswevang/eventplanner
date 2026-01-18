import { prisma } from "@/lib/prisma";
import styles from "./location.module.css";
import Link from "next/link";
import { ChevronLeft, MapPin, ExternalLink, Church, UtensilsCrossed, PartyPopper } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LocationPage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen arrangement funnet.</div>;
    }

    // Check if location is visible to guests
    const config = event.config as any;
    if (config?.locationVisible === false) {
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

    const settings = event.settings as any;

    // Multiple venues
    const venues = [
        {
            icon: Church,
            title: "Seremoni / Vielse",
            name: settings?.ceremonyName,
            address: settings?.ceremonyAddress,
            mapUrl: settings?.ceremonyMapUrl
        },
        {
            icon: UtensilsCrossed,
            title: "Middag",
            name: settings?.dinnerName,
            address: settings?.dinnerAddress,
            mapUrl: settings?.dinnerMapUrl
        },
        {
            icon: PartyPopper,
            title: "Fest",
            name: settings?.partyName,
            address: settings?.partyAddress,
            mapUrl: settings?.partyMapUrl
        }
    ].filter(v => v.name || v.address);

    const locationInfo = settings?.locationInfo || "";
    const hasContent = venues.length > 0 || locationInfo;

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
    );
}
