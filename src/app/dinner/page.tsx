import styles from "./dinner.module.css";
import Link from "next/link";
import { Utensils, Clock, MapPin, ChevronLeft, Info, Church, BookOpen } from "lucide-react";
import MapPopover from "@/components/MapPopover";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export default async function DinnerPage({
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
    const isProtected = settings.landingPage?.protectedDinner === true;
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
                        <h1 className="title-gradient">{event.name || "Middag"}</h1>
                        <p className={styles.intro}>Velkommen til middag. Vi gleder oss stort til å dele denne dagen med dere.</p>
                    </header>

                    <section className={styles.grid}>
                        <div className={`${styles.card} glass`}>
                            <Church className={styles.icon} />
                            <h3>Vielse</h3>
                            <p>{settings.ceremonyName || "Tiller Kirke"} kl. {settings.ceremonyTime || "12:00"}</p>
                            <p className={styles.detail}>Vennligst møt opp i god tid.</p>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <Utensils className={styles.icon} />
                            <h3>Middag</h3>
                            <p>Middagen serveres kl. {settings.dinnerTime || "17:00"}</p>
                            <p className={styles.detail}>{settings.dinnerVenueName || "Flotten Forsamlingshus"}</p>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <MapPin className={styles.icon} />
                            <h3>Sted</h3>
                            <p>
                                <MapPopover
                                    venueName={settings.dinnerVenueName || "Flotten Forsamlingshus"}
                                    address={settings.dinnerAddress || "Tillerbruvegen 147, 7092 Tiller"}
                                />
                            </p>
                            <p className={styles.detail}>{settings.dinnerAddress || "Tillerbruvegen 147, 7092 Tiller"}</p>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <BookOpen className={styles.icon} />
                            <h3>Meny</h3>
                            <p>{settings.menuTitle || "Sesongbasert 3-retters"}</p>
                            <p className={styles.detail}>Gi beskjed om allergier.</p>
                        </div>

                        <Link href={`/info?eventId=${eventId}`} className={`${styles.card} glass`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Info className={styles.icon} />
                            <h3>Praktisk info</h3>
                            <p>Kontaktinfo forlovere og toastmaster</p>
                            <p className={styles.detail}>Trykk for mer info</p>
                        </Link>
                    </section>

                    <div className={styles.actions}>
                        <Link href={`/wishlist?eventId=${eventId}`} className="luxury-button">
                            Se ønskeliste
                        </Link>
                        <Link href={`/playlist?eventId=${eventId}`} className="luxury-button" style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>
                            Ønsk deg en sang
                        </Link>
                    </div>
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
