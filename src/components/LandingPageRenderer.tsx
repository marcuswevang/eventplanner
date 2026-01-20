import React from 'react';
import Link from 'next/link';
import ImageStream from './ImageStream';
import Countdown from './Countdown';
import styles from '../app/page.module.css';

const DEFAULT_SETTINGS = {
    countdownDate: '2026-08-15T15:00:00',
    landingPage: {
        titleNames: "Marita & Marcus",
        dateText: "15. AUGUST 2026",
        welcomeText: "Velkommen til vår store dag",
        showGallery: true,
        showRsvp: true,
        showDinner: true,
        showParty: true,
        showWishlist: true,
        showPlaylist: true,
        layout: ["title", "gallery", "date", "welcome", "countdown", "rsvp", "links"],
        verticalOffset: 15
    }
};

interface LandingPageRendererProps {
    settings: any;
}

const LandingPageRenderer: React.FC<LandingPageRendererProps> = ({ settings }) => {
    const layout = settings.landingPage?.layout || DEFAULT_SETTINGS.landingPage.layout;
    const s = settings || DEFAULT_SETTINGS;

    const renderComponent = (component: string) => {
        switch (component) {
            case "title":
                return (
                    <div key="title" className={styles.title} style={{ marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <h1 className="title-gradient">{s.landingPage?.titleNames || DEFAULT_SETTINGS.landingPage.titleNames}</h1>
                    </div>
                );
            case "date":
                return (
                    <div key="date" className={styles.date} style={{ textAlign: 'center', marginBottom: '0.5rem', width: '100%' }}>
                        {s.landingPage?.dateText || DEFAULT_SETTINGS.landingPage.dateText}
                    </div>
                );
            case "welcome":
                return (
                    <div key="welcome" className={styles.welcome} style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
                        {s.landingPage?.welcomeText || DEFAULT_SETTINGS.landingPage.welcomeText}
                    </div>
                );
            case "text":
                return (
                    <div key="text" style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
                        <div className={styles.date}>{s.landingPage?.dateText || DEFAULT_SETTINGS.landingPage.dateText}</div>
                        <div className={styles.welcome}>{s.landingPage?.welcomeText || DEFAULT_SETTINGS.landingPage.welcomeText}</div>
                    </div>
                );
            case "countdown":
                return (
                    <div key="countdown" style={{ marginBottom: '2rem' }}>
                        <Countdown targetDate={s.countdownDate || DEFAULT_SETTINGS.countdownDate} />
                    </div>
                );
            case "rsvp":
                return (s.landingPage?.showRsvp ?? true) ? (
                    <div key="rsvp" className={styles.actions} style={{ marginBottom: '1rem' }}>
                        <Link href="/rsvp" className="luxury-button">
                            Svar på invitasjon
                        </Link>
                    </div>
                ) : null;
            case "links":
                return ((s.landingPage?.showDinner ?? true) || (s.landingPage?.showParty ?? true) || (s.landingPage?.showWishlist ?? true) || (s.landingPage?.showPlaylist ?? true)) ? (
                    <div key="links" className={styles.actions} style={{ marginBottom: '2rem' }}>
                        <div className={styles.secondaryActions}>
                            {(s.landingPage?.showDinner ?? true) && (
                                <Link href="/dinner" className={styles.actionLink}>Middag</Link>
                            )}
                            {(s.landingPage?.showDinner ?? true) && (s.landingPage?.showParty ?? true) && (
                                <span className={styles.separator}>|</span>
                            )}
                            {(s.landingPage?.showParty ?? true) && (
                                <Link href="/party" className={styles.actionLink}>Fest</Link>
                            )}
                            {((s.landingPage?.showDinner ?? true) || (s.landingPage?.showParty ?? true)) && (s.landingPage?.showWishlist ?? true) && (
                                <span className={styles.separator}>|</span>
                            )}
                            {(s.landingPage?.showWishlist ?? true) && (
                                <Link href="/wishlist" className={styles.actionLink}>Ønskeliste</Link>
                            )}
                            {((s.landingPage?.showDinner ?? true) || (s.landingPage?.showParty ?? true) || (s.landingPage?.showWishlist ?? true)) && (s.landingPage?.showPlaylist ?? true) && (
                                <span className={styles.separator}>|</span>
                            )}
                            {(s.landingPage?.showPlaylist ?? true) && (
                                <Link href="/playlist" className={styles.actionLink}>Sangønsker</Link>
                            )}
                        </div>
                    </div>
                ) : null;
            case "actions": // Legacy support
                return (
                    <div key="actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {renderComponent("rsvp")}
                        {renderComponent("links")}
                    </div>
                );
            case "gallery":
                return (s.landingPage?.showGallery ?? true) ? (
                    <div key="gallery" style={{ marginBottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ImageStream instagramHashtag={s.common?.instagramHashtag} />
                    </div>
                ) : null;
            case "hero": // Legacy support for migration
                return (
                    <div key="hero" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 className="title-gradient">{s.landingPage?.titleNames || DEFAULT_SETTINGS.landingPage.titleNames}</h1>
                        <div className={styles.date}>{s.landingPage?.dateText || DEFAULT_SETTINGS.landingPage.dateText}</div>
                        <div className={styles.welcome}>{s.landingPage?.welcomeText || DEFAULT_SETTINGS.landingPage.welcomeText}</div>
                        <div style={{ marginBottom: '2rem' }}>
                            <Countdown targetDate={s.countdownDate} />
                        </div>
                        <div className={styles.actions} style={{ marginBottom: '2rem' }}>
                            {(s.landingPage?.showRsvp ?? true) && (
                                <Link href="/rsvp" className="luxury-button">
                                    Svar på invitasjon
                                </Link>
                            )}
                            {((s.landingPage?.showDinner ?? true) || (s.landingPage?.showParty ?? true)) && (
                                <div className={styles.secondaryActions}>
                                    {(s.landingPage?.showDinner ?? true) && (
                                        <Link href="/dinner" className={styles.actionLink}>Middag</Link>
                                    )}
                                    {(s.landingPage?.showDinner ?? true) && (s.landingPage?.showParty ?? true) && (
                                        <span className={styles.separator}>|</span>
                                    )}
                                    {(s.landingPage?.showParty ?? true) && (
                                        <Link href="/party" className={styles.actionLink}>Fest</Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section
            className={styles.hero}
            style={{ paddingTop: `${s.landingPage?.verticalOffset ?? DEFAULT_SETTINGS.landingPage.verticalOffset}vh` }}
        >
            {layout.map((component: string) => renderComponent(component))}
        </section>
    );
};

export default LandingPageRenderer;
