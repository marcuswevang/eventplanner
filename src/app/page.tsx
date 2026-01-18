"use client";

import styles from "./page.module.css";
import Countdown from "@/components/Countdown";
import Link from "next/link";
import { Heart } from "lucide-react";
import ImageStream from "@/components/ImageStream";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <p className={styles.topSubtitle}>Velkommen til</p>
          <h1 className={styles.title}>
            <span className={styles.name}>Event</span>
            <span className={styles.ampersand}>Planner</span>
          </h1>
          <p className={styles.date}>Planlegg din store dag</p>

          <Countdown />

          <ImageStream />


          <div className={styles.selectionTitle}>
            <Heart size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>Ditt alt-i-ett planleggingsverktøy</span>
          </div>
        </div>
      </div>
    </main>
  );
}
