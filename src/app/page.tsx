import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import LandingPageRenderer from "@/components/LandingPageRenderer";

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

export default async function Home() {
  const event = await prisma.event.findFirst();
  const settings = (event?.settings as any) || DEFAULT_SETTINGS;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <LandingPageRenderer settings={settings} />
      </main>
    </div>
  );
}
