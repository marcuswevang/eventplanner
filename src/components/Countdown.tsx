"use client";

import { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownProps {
    targetDate?: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const weddingDate = targetDate ? new Date(targetDate) : new Date('2026-08-15T15:00:00');
            const now = new Date();
            const difference = weddingDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <div className={styles.container}>
            <div className={styles.unit}>
                <span className={styles.value}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span className={styles.label}>Dager</span>
            </div>
            <div className={styles.separator}>:</div>
            <div className={styles.unit}>
                <span className={styles.value}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={styles.label}>Timer</span>
            </div>
            <div className={styles.separator}>:</div>
            <div className={styles.unit}>
                <span className={styles.value}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={styles.label}>Minutter</span>
            </div>
            <div className={styles.separator}>:</div>
            <div className={styles.unit}>
                <span className={styles.value}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className={styles.label}>Sekunder</span>
            </div>
        </div>
    );
}
