import styles from "./party.module.css";
import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import MapPopover from "@/components/MapPopover";
import { prisma } from "@/lib/prisma";
import { ICON_LIBRARY } from "@/components/IconPicker";

const DEFAULT_SETTINGS = {
    title: "Marita & Marcus",
    intro: "Velkommen til fest! Vi gleder oss til å danse natten lang med dere.",
    cards: [
        { id: "ceremony", title: "Vielse", icon: "Church", text: "Tiller Kirke kl. 12:00", details: "15. august 2026" },
        { id: "party", title: "Fest", icon: "Music", text: "Festen starter kl. 21:00", details: "Flotten Forsamlingshus" },
        { id: "place", title: "Sted", icon: "MapPin", text: "Tillerbruvegen 147", details: "7092 Tiller" },
        { id: "serving", title: "Servering", icon: "GlassWater", text: "Åpen bar og snacks", details: "Nattmat serveres ved midnatt." },
        { id: "practical", title: "Praktisk info", icon: "Info", text: "Kontaktinfo forlovere og toastmaster", details: "Trykk for mer info" }
    ]
};

export default async function PartyPage() {
    const event = await prisma.event.findFirst();
    const settings = (event?.settings as any)?.partyPage || DEFAULT_SETTINGS;

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
                    <h1 className="title-gradient">{settings.title}</h1>
                    <p className={styles.intro}>{settings.intro}</p>
                </header>

                <section className={styles.grid}>
                    {settings.cards.map((card: any) => {
                        const Icon = ICON_LIBRARY[card.icon] || Info;
                        const isPractical = card.id === 'practical';

                        if (isPractical) {
                            return (
                                <Link key={card.id} href="/info" className={`${styles.card} glass`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Icon className={styles.icon} />
                                    <h3>{card.title}</h3>
                                    <p>{card.text}</p>
                                    <p className={styles.detail}>{card.details}</p>
                                </Link>
                            );
                        }

                        return (
                            <div key={card.id} className={`${styles.card} glass`}>
                                <Icon className={styles.icon} />
                                <h3>{card.title}</h3>
                                {card.id === 'place' ? (
                                    <p>
                                        <MapPopover
                                            venueName={card.text}
                                            address={card.details}
                                        />
                                    </p>
                                ) : (
                                    <p>{card.text}</p>
                                )}
                                <p className={styles.detail}>{card.details}</p>
                            </div>
                        );
                    })}
                </section>

                <div className={styles.actions}>
                    <Link href="/wishlist" className="luxury-button">
                        Se ønskeliste
                    </Link>
                    <Link href="/playlist" className="luxury-button" style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>
                        Ønsk deg en sang
                    </Link>
                </div>
            </main>
        </div>
    );
}
