"use client";

import { useState, useEffect } from 'react';
import styles from './ImageStream.module.css';
import { Instagram } from 'lucide-react';

const images = [
    '/hovedside.jpg',
    '/bakgrunnsbilde.jpg'
];

interface ImageStreamProps {
    instagramHashtag?: string;
}

export default function ImageStream({ instagramHashtag = "#mpw2026" }: ImageStreamProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % (images.length + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.container}>
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                    style={{ backgroundImage: `url(${src})` }}
                />
            ))}

            <div className={`${styles.slide} ${styles.hashtagSlide} ${currentIndex === images.length ? styles.active : ''}`}>
                <div className={styles.hashtagContent}>
                    <Instagram size={48} className={styles.icon} />
                    <h2>Del deres øyeblikk</h2>
                    <p className={styles.hashtag}>{instagramHashtag}</p>
                    <p className={styles.info}>Bruk emneknaggen på Instagram</p>
                </div>
            </div>

            <div className={styles.indicator}>
                {[...Array(images.length + 1)].map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
