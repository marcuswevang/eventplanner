import React from 'react';
import Link from 'next/link';
import ImageStream from './ImageStream';
import Countdown from './Countdown';
import styles from '../app/page.module.css';

const DEFAULT_SETTINGS = {
    countdownDate: '2026-08-15T15:00:00',
    landingPage: {
        titleNames: "Event & Planner",
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
    eventId: string;
}

const LandingPageRenderer: React.FC<LandingPageRendererProps> = ({ settings, eventId }) => {
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
                const showProgram = s.landingPage?.showProgram ?? true;
                const showLocation = s.landingPage?.showLocation ?? true;
                const showDinner = s.landingPage?.showDinner ?? true;
                const showParty = s.landingPage?.showParty ?? true;
                const showWishlist = s.landingPage?.showWishlist ?? true;
                const showPlaylist = s.landingPage?.showPlaylist ?? true;

                const links = [
                    { show: showProgram, id: 'program', label: 'Program' },
                    { show: showLocation, id: 'location', label: 'Sted' },
                    { show: showDinner, id: 'dinner', label: 'Middag' },
                    { show: showParty, id: 'party', label: 'Fest' },
                    { show: showWishlist, id: 'wishlist', label: 'Ønskeliste' },
                    { show: showPlaylist, id: 'playlist', label: 'Sangønsker' }
                ].filter(l => l.show);

                return links.length >= 1 ? (
                    <div key="links" className={styles.actions} style={{ marginBottom: '2rem' }}>
                        <div className={styles.secondaryActions}>
                            {links.map((link, idx) => (
                                <React.Fragment key={link.id}>
                                    <Link href={`/${link.id}?eventId=${eventId}`} className={styles.actionLink}>
                                        {link.label}
                                    </Link>
                                    {idx < links.length - 1 && (
                                        <span className={styles.separator}>|</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "gallery":
                return (s.landingPage?.showGallery ?? true) ? (
                    <div key="gallery" style={{ marginBottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ImageStream eventId={eventId} />
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <section
            className={styles.hero}
            style={{ paddingTop: `${s.landingPage?.verticalOffset ?? DEFAULT_SETTINGS.landingPage.verticalOffset}vh` }}
        >
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                {layout.map((component: string) => renderComponent(component))}
            </div>
        </section>
    );
};

export default LandingPageRenderer;
