import styles from "./info.module.css";
import Link from "next/link";
import { ChevronLeft, User, Phone, MessageSquare, Instagram, Camera, Sparkles, Gem } from "lucide-react";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export default async function InfoPage({
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

    // Check if info is visible to guests
    const isShowing = settings.landingPage?.showInfo !== false;

    if (!isShowing) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <Gem size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Informasjon utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Denne informasjonen er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const isProtected = settings.landingPage?.protectedInfo === true;
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
                        <h1 className="title-gradient">Praktisk Informasjon</h1>
                        <p className={styles.intro}>Her finner du kontaktinformasjon til personene som hjelper oss å gjøre denne dagen spesiell.</p>
                    </header>

                    <section className={styles.grid}>
                        <div className={`${styles.card} glass`}>
                            <User className={styles.icon} />
                            <h3>Toastmaster</h3>
                            <div className={styles.contactInfo}>
                                <p className={styles.name}>{settings.toastmasterName || "Dag Skage"}</p>
                                <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {settings.toastmasterPhone || "+47 97 13 17 15"}</p>
                            </div>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <Sparkles className={styles.icon} />
                            <h3>Forlovere (Brud)</h3>
                            <div className={styles.contactInfo}>
                                <div className={styles.person}>
                                    <p className={styles.name}>{settings.maidOfHonor1Name || "Linn Hoffstrøm Gram"}</p>
                                    <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {settings.maidOfHonor1Phone || "+47 91 37 25 05"}</p>
                                </div>
                                {settings.maidOfHonor2Name && (
                                    <div className={styles.person}>
                                        <p className={styles.name}>{settings.maidOfHonor2Name}</p>
                                        <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {settings.maidOfHonor2Phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <Gem className={styles.icon} />
                            <h3>Forlovere (Brudgom)</h3>
                            <div className={styles.contactInfo}>
                                <div className={styles.person}>
                                    <p className={styles.name}>{settings.bestMan1Name || "Navn Navnesen"}</p>
                                    <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {settings.bestMan1Phone || "+47 000 00 000"}</p>
                                </div>
                                {settings.bestMan2Name && (
                                    <div className={styles.person}>
                                        <p className={styles.name}>{settings.bestMan2Name}</p>
                                        <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {settings.bestMan2Phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <MessageSquare className={styles.icon} />
                            <h3>Taler</h3>
                            <p>Ønsker du å si noen ord? Ta kontakt med toastmaster i god tid før bryllupet.</p>
                        </div>

                        <div className={`${styles.card} glass`}>
                            <Camera className={styles.icon} />
                            <h3>Bilder</h3>
                            <p>Del gjerne deres bilder fra dagen med oss på Instagram!</p>
                            <div className={styles.hashtagBox}>
                                <Instagram size={18} />
                                <span className={styles.hashtag}>{settings.instagramHashtag || "#mpw2026"}</span>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </GuestProtectionWrapper>
    );
}
