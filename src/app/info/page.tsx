import styles from "./info.module.css";
import Link from "next/link";
import { ChevronLeft, User, Phone, MessageSquare, Instagram, Camera, Sparkles, Gem, Star, Mic2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNorwegianPhoneNumber } from "@/utils/format";

export const dynamic = 'force-dynamic';

const ROLE_ICONS: Record<string, any> = {
    "Toastmaster": Mic2,
    "Forlover (Brud)": Sparkles,
    "Forlover (Brudgom)": Gem,
    "Brud": Heart,
    "Brudgom": Crown,
    "Takk for maten": Star
};

// Fallback for Heart and Crown as they are used in icons but might not be in the direct list
import { Heart, Crown } from "lucide-react";

export default async function InfoPage() {
    // Fetch event and guests
    const event = await prisma.event.findFirst();
    const guests = await prisma.guest.findMany({
        where: { eventId: event?.id },
        orderBy: { name: 'asc' }
    });

    const eventSettings = (event?.settings as any) || {};
    const hashtag = eventSettings.common?.instagramHashtag || "#mpw2026";

    // Group guests by role
    const guestsWithRoles = guests.filter(g => g.role && g.role !== "");

    const toastmasters = guestsWithRoles.filter(g => g.role === "Toastmaster");
    const bridgeMaids = guestsWithRoles.filter(g => g.role === "Forlover (Brud)");
    const groomMen = guestsWithRoles.filter(g => g.role === "Forlover (Brudgom)");

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.backLink}>
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
                    {toastmasters.length > 0 && (
                        <div className={`${styles.card} glass`}>
                            <Mic2 className={styles.icon} />
                            <h3>Toastmaster</h3>
                            <div className={styles.contactInfo}>
                                {toastmasters.map(tm => (
                                    <div key={tm.id} className={styles.person}>
                                        <p className={styles.name}>{tm.name}</p>
                                        {tm.mobile && (
                                            <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {formatNorwegianPhoneNumber(tm.mobile)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {bridgeMaids.length > 0 && (
                        <div className={`${styles.card} glass`}>
                            <Sparkles className={styles.icon} />
                            <h3>Forlovere (Brud)</h3>
                            <div className={styles.contactInfo}>
                                {bridgeMaids.map(bm => (
                                    <div key={bm.id} className={styles.person}>
                                        <p className={styles.name}>{bm.name}</p>
                                        {bm.mobile && (
                                            <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {formatNorwegianPhoneNumber(bm.mobile)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {groomMen.length > 0 && (
                        <div className={`${styles.card} glass`}>
                            <Gem className={styles.icon} />
                            <h3>Forlovere (Brudgom)</h3>
                            <div className={styles.contactInfo}>
                                {groomMen.map(gm => (
                                    <div key={gm.id} className={styles.person}>
                                        <p className={styles.name}>{gm.name}</p>
                                        {gm.mobile && (
                                            <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> {formatNorwegianPhoneNumber(gm.mobile)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            <span className={styles.hashtag}>{hashtag}</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
