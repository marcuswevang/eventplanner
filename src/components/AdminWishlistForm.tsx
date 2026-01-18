"use client";

import { useState } from "react";
import { addWishlistItem } from "@/app/actions";
import styles from "./AdminWishlistForm.module.css";
import { PlusCircle, Image as ImageIcon, Link as LinkIcon, MapPin, Gift, Loader2 } from "lucide-react";

export default function AdminWishlistForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const result = await addWishlistItem(title, description, imageUrl, link);

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage("Ønske lagt til!");
            setTitle("");
            setDescription("");
            setImageUrl("");
            setLink("");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
            <h3>Legg til nytt ønske</h3>

            <div className={styles.field}>
                <label><Gift size={16} /> Hva (Tittel)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="F.eks. Kjøkkenmaskin"
                />
            </div>

            <div className={styles.field}>
                <label><MapPin size={16} /> Hvor (Butikk/Beskrivelse)</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="F.eks. Elkjøp, Power..."
                />
            </div>

            <div className={styles.field}>
                <label><ImageIcon size={16} /> Bilde (URL)</label>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                />
            </div>

            <div className={styles.field}>
                <label><LinkIcon size={16} /> Lenke (URL)</label>
                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? <Loader2 className="spin" /> : <PlusCircle size={20} />}
                Legg til ønske
            </button>

            {message && <p className={styles.message}>{message}</p>}
        </form>
    );
}
