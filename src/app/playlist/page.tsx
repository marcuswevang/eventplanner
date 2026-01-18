import { prisma } from "@/lib/prisma";
import styles from "./playlist.module.css";
import Link from "next/link";
import { ChevronLeft, Music } from "lucide-react";
import PlaylistClient from "./PlaylistClient";
import { getEventTerm } from "@/lib/terminology";

export const dynamic = 'force-dynamic';

export default async function PlaylistPage() {
    const event = await prisma.event.findFirst();

    if (!event) {
        return <div>Ingen spilleliste funnet.</div>;
    }

    const term = getEventTerm(event.type);

    const requests = await prisma.songRequest.findMany({
        where: { eventId: event.id },
        orderBy: { createdAt: "desc" },
    });

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
                        <PlaylistClient eventId={event.id} />
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
    );
}
