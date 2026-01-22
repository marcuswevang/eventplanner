import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import LandingPageRenderer from "@/components/LandingPageRenderer";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";
import { checkEventAuth } from "@/app/actions";
import { resolveEvent, isEventActive } from "@/lib/event";
import { ShieldAlert } from "lucide-react";

export const dynamic = 'force-dynamic';

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
    layout: ["title", "gallery", "date", "welcome", "countdown", "rsvp", "links"]
  }
};

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const slug = params.slug as string;
  const eventIdParam = params.eventId as string;

  const event = await resolveEvent(slug || eventIdParam);

  if (!event) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '3rem' }}>404</h1>
          <p>Vi fant ikke arrangementet du leter etter.</p>
        </div>
      </div>
    );
  }

  if (!isEventActive(event)) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'center', padding: '2rem' }}>
        <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
          <ShieldAlert size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
          <h1 className="title-gradient">Siden er deaktivert</h1>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Dette arrangementet er for øyeblikket ikke tilgjengelig.
            Vennligst ta kontakt med administratoren hvis du mener dette er en feil.
          </p>
        </div>
      </div>
    );
  }

  const eventId = event.id;
  const isProtected = !!event.guestPassword;
  const isAuthenticated = await checkEventAuth(eventId);
  const settings = (event?.settings as any) || DEFAULT_SETTINGS;

  return (
    <GuestProtectionWrapper eventId={eventId} isInitiallyAuthenticated={isAuthenticated || !isProtected}>
      <div className={styles.container}>
        <main className={styles.main}>
          <LandingPageRenderer settings={settings} />
        </main>
      </div>
    </GuestProtectionWrapper>
  );
}
