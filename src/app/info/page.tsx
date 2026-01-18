import styles from "./info.module.css";
import Link from "next/link";
import { ChevronLeft, User, Phone, MessageSquare, Instagram, Camera, Sparkles, Gem } from "lucide-react";

export default function InfoPage() {
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
                    <div className={`${styles.card} glass`}>
                        <User className={styles.icon} />
                        <h3>Toastmaster</h3>
                        <div className={styles.contactInfo}>
                            <p className={styles.name}>Dag Skage</p>
                            <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> +47 97 13 17 15</p>
                        </div>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <Sparkles className={styles.icon} />
                        <h3>Forlovere (Brud)</h3>
                        <div className={styles.contactInfo}>
                            <div className={styles.person}>
                                <p className={styles.name}>Linn Hoffstrøm Gram</p>
                                <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> +47 91 37 25 05</p>
                            </div>
                            <div className={styles.person}>
                                <p className={styles.name}>Torild Sletta-Heimdal</p>
                                <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> +47 90 87 91 02</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.card} glass`}>
                        <Gem className={styles.icon} />
                        <h3>Forlovere (Brudgom)</h3>
                        <div className={styles.contactInfo}>
                            <div className={styles.person}>
                                <p className={styles.name}>Navn Navnesen</p>
                                <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> +47 000 00 000</p>
                            </div>
                            <div className={styles.person}>
                                <p className={styles.name}>Navn Navnesen</p>
                                <p className={styles.phone}><Phone size={14} style={{ marginRight: '4px' }} /> +47 000 00 000</p>
                            </div>
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
                            <span className={styles.hashtag}>#mpw2026</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
