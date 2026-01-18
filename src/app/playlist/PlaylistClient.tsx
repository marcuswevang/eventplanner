"use client";

import { useState } from "react";
import { addSongRequest } from "@/app/actions";
import styles from "./playlist.module.css";

export default function PlaylistClient({ eventId }: { eventId: string }) {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !artist.trim() || !name.trim()) return;

        setLoading(true);
        const result = await addSongRequest(eventId, title, artist, name);
        setLoading(false);

        if (result.success) {
            setTitle("");
            setArtist("");
            setName("");
        } else {
            alert(result.error);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <label>Sangtittel</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="f.eks. Dancing Queen"
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Artist</label>
                <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="f.eks. ABBA"
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Ditt navn</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hvem ønsker?"
                    required
                />
            </div>
            <button type="submit" className="luxury-button" disabled={loading}>
                {loading ? "Legger til..." : "Legg til ønske"}
            </button>
        </form>
    );
}
