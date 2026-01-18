import styles from "./page.module.css";
import Countdown from "@/components/Countdown";
import { Heart, ShieldAlert } from "lucide-react";
import ImageStream from "@/components/ImageStream";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";
import { checkEventAuth } from "@/app/actions";
import { resolveEvent, isEventActive } from "@/lib/event";

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

  return (
    <GuestProtectionWrapper eventId={eventId} isInitiallyAuthenticated={isAuthenticated || !isProtected}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.overlay}></div>
          <div className={styles.content}>
            <p className={styles.topSubtitle}>Velkommen til</p>
            <h1 className={styles.title}>
              <span className={styles.name}>{event.name?.split(' ')[0] || "Event"}</span>
              <span className={styles.ampersand}>{event.name?.split(' ')[1] || "Planner"}</span>
            </h1>
            <p className={styles.date}>{event.date ? new Date(event.date).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' }) : "Planlegg din store dag"}</p>

            <Countdown targetDate={event.date} />

            <ImageStream eventId={eventId} />

            <div className={styles.selectionTitle}>
              <Heart size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
              <span>Ditt alt-i-ett planleggingsverktøy</span>
            </div>
          </div>
        </div>
      </main>
    </GuestProtectionWrapper>
  );
}


