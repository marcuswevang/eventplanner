import { prisma } from "@/lib/prisma";
import styles from "./gallery.module.css";
import { Camera, Instagram, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function GalleryPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const eventId = params.eventId as string;

    if (!eventId) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <Camera size={48} />
                    <h1>Galleri</h1>
                    <p>Vennligst oppgi en event-ID for å se galleriet.</p>
                </div>
            </div>
        );
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });

    // Check if gallery is visible to guests
    const config = event?.config as any;
    if (config?.galleryVisible === false) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', textAlign: 'center', padding: '2rem' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
                    <Camera size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Galleri utilgjengelig</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Galleriet er for øyeblikket ikke tilgjengelig.
                    </p>
                </div>
            </div>
        );
    }

    const items = await prisma.galleryItem.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href={`/?eventId=${eventId}`} className={styles.backLink}>
                    <ArrowLeft size={20} />
                    <span>Til forsiden</span>
                </Link>
                <h1>Glimt fra {event?.name || "arrangementet"}</h1>
                <p>Delte øyeblikk fra festen</p>
            </header>

            <div className={styles.grid}>
                {items.length === 0 && (
                    <div className={styles.empty}>
                        <ImageIcon size={48} />
                        <p>Ingen bilder er lagt til ennå.</p>
                    </div>
                )}
                {items.map((item: any) => (
                    <div key={item.id} className={`${styles.item} glass`}>
                        <div className={styles.mediaWrapper}>
                            <img src={item.url} alt={item.caption || "Galleri-bilde"} />
                            {item.source === "INSTAGRAM" && (
                                <div className={styles.sourceBadge}>
                                    <Instagram size={14} />
                                    <span>Instagram</span>
                                </div>
                            )}
                        </div>
                        {item.caption && (
                            <div className={styles.caption}>
                                {item.caption}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
