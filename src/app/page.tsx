import styles from "./page.module.css";
import Countdown from "@/components/Countdown";
import { Heart } from "lucide-react";
import ImageStream from "@/components/ImageStream";
import { prisma } from "@/lib/prisma";
import GuestProtectionWrapper from "@/components/GuestProtectionWrapper";
import { checkEventAuth } from "@/app/actions";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  let eventId = params.eventId as string;

  if (!eventId) {
    const firstEvent = await prisma.event.findFirst();
    eventId = firstEvent?.id || "";
  }

  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;
  const isProtected = !!event?.guestPassword;
  const isAuthenticated = await checkEventAuth(eventId);

  return (
    <GuestProtectionWrapper eventId={eventId} isInitiallyAuthenticated={isAuthenticated || !isProtected}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.overlay}></div>
          <div className={styles.content}>
            <p className={styles.topSubtitle}>Velkommen til</p>
            <h1 className={styles.title}>
              <span className={styles.name}>{event?.name?.split(' ')[0] || "Event"}</span>
              <span className={styles.ampersand}>{event?.name?.split(' ')[1] || "Planner"}</span>
            </h1>
            <p className={styles.date}>{event?.date ? new Date(event.date).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' }) : "Planlegg din store dag"}</p>

            <Countdown targetDate={event?.date} />

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

