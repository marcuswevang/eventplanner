"use client";

import { useState } from "react";
import styles from "./GalleryUploader.module.css";
import { Upload, Image as ImageIcon, X, Loader2, Instagram, Link as LinkIcon } from "lucide-react";
import { addGalleryItem } from "@/app/actions";

export default function GalleryUploader({ eventId }: { eventId: string }) {
    const [isUploading, setIsUploading] = useState(false);
    const [type, setType] = useState<"UPLOAD" | "INSTAGRAM">("UPLOAD");
    const [input, setInput] = useState("");
    const [caption, setCaption] = useState("");

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let result;
            if (type === "INSTAGRAM") {
                // Simplified: input is the URL or ID
                result = await addGalleryItem(eventId, input, caption, "INSTAGRAM");
            } else {
                // Simplified: input is the local URL/Path for now (simulating upload)
                result = await addGalleryItem(eventId, input, caption, "UPLOAD");
            }

            if (result.success) {
                setInput("");
                setCaption("");
                alert("Bilde lagt til!");
            } else {
                alert(result.error);
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`${styles.container} glass`}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${type === "UPLOAD" ? styles.active : ""}`}
                    onClick={() => setType("UPLOAD")}
                >
                    <Upload size={18} />
                    <span>Last opp</span>
                </button>
                <button
                    className={`${styles.tab} ${type === "INSTAGRAM" ? styles.active : ""}`}
                    onClick={() => setType("INSTAGRAM")}
                >
                    <Instagram size={18} />
                    <span>Instagram</span>
                </button>
            </div>

            <form className={styles.form} onSubmit={handleUpload}>
                <div className={styles.field}>
                    <label>{type === "UPLOAD" ? "Bilde-URL (Simulert opplasting)" : "Instagram Post URL"}</label>
                    <div className={styles.inputWrapper}>
                        {type === "UPLOAD" ? <ImageIcon size={18} /> : <LinkIcon size={18} />}
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={type === "UPLOAD" ? "https://eksempel.no/bilde.jpg" : "https://instagram.com/p/..."}
                            required
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label>Bildetekst (valgfritt)</label>
                    <input
                        type="text"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="Skriv en hyggelig tekst..."
                    />
                </div>

                <button type="submit" className={styles.submitButton} disabled={isUploading}>
                    {isUploading ? <Loader2 className="spin" size={20} /> : "Legg til i galleri"}
                </button>
            </form>
        </div>
    );
}
