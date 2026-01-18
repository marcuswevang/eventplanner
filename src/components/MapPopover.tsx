"use client";

import { useState } from "react";
import styles from "./MapPopover.module.css";
import { X } from "lucide-react";

interface MapPopoverProps {
    venueName: string;
    address: string;
}

export default function MapPopover({ venueName, address }: MapPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);

    const togglePopover = () => setIsOpen(!isOpen);

    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <>
            <span className={styles.trigger} onClick={togglePopover}>
                {venueName}
            </span>

            {isOpen && (
                <div className={styles.overlay} onClick={togglePopover}>
                    <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={togglePopover} aria-label="Lukk">
                            <X size={24} />
                        </button>
                        <iframe
                            src={mapUrl}
                            className={styles.iframe}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Kart til ${venueName}`}
                        ></iframe>
                    </div>
                </div>
            )}
        </>
    );
}
