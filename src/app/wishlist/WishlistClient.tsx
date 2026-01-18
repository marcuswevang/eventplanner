"use client";

import { useState } from "react";
import { markAsPurchased } from "@/app/actions";
import styles from "./wishlist.module.css";
import { Check } from "lucide-react";

interface WishlistClientProps {
    itemId: string;
    title: string;
}

export default function WishlistClient({ itemId, title }: WishlistClientProps) {
    const [isOpening, setIsOpening] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        const result = await markAsPurchased(itemId);
        setLoading(false);

        if (result.success) {
            setIsOpening(false);
        } else {
            alert(result.error);
        }
    };

    if (!isOpening) {
        return (
            <button
                className={styles.purchaseButton}
                onClick={() => setIsOpening(true)}
            >
                Marker som kjøpt
            </button>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.confirmText}>Bekreft at du har kjøpt denne gaven?</p>
            <div className={styles.formActions}>
                <button type="submit" className={styles.confirmButton} disabled={loading}>
                    {loading ? "Oppdaterer..." : "Ja, marker som kjøpt"}
                </button>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setIsOpening(false)}
                >
                    Avbryt
                </button>
            </div>
        </form>
    );
}
