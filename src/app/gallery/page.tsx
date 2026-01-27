import { prisma } from "@/lib/prisma";
import styles from "./gallery.module.css";
import { Camera, Instagram, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { resolveEvent } from "@/lib/event";
import { checkEventAuth } from "@/app/actions";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";

export const dynamic = 'force-dynamic';

export default async function GalleryPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const eventIdParam = params.eventId as string;
    const event = await resolveEvent(eventIdParam);

    if (!event) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <Camera size={48} />
                    <h1>Galleri</h1>
                    <p>Vi fant ikke arrangementet du leter etter.</p>
                </div>
            </div>
        );
    }

    const eventId = event.id;
    const settings = (event.settings as any) || {};
    const config = (event.config as any) || {};

    // Check if gallery is visible to guests
    const isShowing = settings.landingPage?.showGallery !== false && config.galleryEnabled !== false;

    if (!isShowing) {
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

    const isProtected = settings.landingPage?.protectedGallery === true;
    const isAuthenticated = await checkEventAuth(eventId);

    const items = await prisma.galleryItem.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <GuestProtectionWrapper eventId={eventId} isInitiallyAuthenticated={isAuthenticated || !isProtected}>
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
        </GuestProtectionWrapper>
    );
}
