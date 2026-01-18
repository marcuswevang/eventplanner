import styles from "./party.module.css";
import Link from "next/link";
import { Music, GlassWater, MapPin, ChevronLeft, Info, Church } from "lucide-react";
import MapPopover from "@/components/MapPopover";

export default function PartyPage() {
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
                    <h1 className="title-gradient">Marita & Marcus</h1>
                    <p className={styles.intro}>Velkommen til fest! Vi gleder oss til å danse natten lang med dere.</p>
                </header>

                <section className={styles.grid}>
                    <div className={`${styles.card} glass`}>
                        <Church className={styles.icon} />
                        <h3>Vielse</h3>
                        <p>Tiller Kirke kl. 12:00</p>
                        <p className={styles.detail}>15. august 2026</p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <Music className={styles.icon} />
                        <h3>Fest</h3>
                        <p>Festen starter kl. 21:00</p>
                        <p className={styles.detail}>Flotten Forsamlingshus</p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <MapPin className={styles.icon} />
                        <h3>Sted</h3>
                        <p>
                            <MapPopover
                                venueName="Flotten Forsamlingshus"
                                address="Tillerbruvegen 147, 7092 Tiller"
                            />
                        </p>
                        <p className={styles.detail}>Tillerbruvegen 147, 7092 Tiller</p>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <GlassWater className={styles.icon} />
                        <h3>Servering</h3>
                        <p>Åpen bar og snacks</p>
                        <p className={styles.detail}>Nattmat serveres ved midnatt.</p>
                    </div>

                    <Link href="/info" className={`${styles.card} glass`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Info className={styles.icon} />
                        <h3>Praktisk info</h3>
                        <p>Kontaktinfo forlovere og toastmaster</p>
                        <p className={styles.detail}>Trykk for mer info</p>
                    </Link>
                </section>

                <div className={styles.actions}>
                    <Link href="/wishlist" className="luxury-button">
                        Se ønskeliste
                    </Link>
                    <Link href="/playlist" className="luxury-button" style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>
                        Legg til en sang
                    </Link>
                </div>
            </main>
        </div>
    );
}
