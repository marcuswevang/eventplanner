"use client";

import { useState, useEffect } from "react";
import styles from "./GuestProtectionWrapper.module.css";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { verifyEventPassword } from "@/app/actions";

export default function GuestProtectionWrapper({
    children,
    eventId,
    isInitiallyAuthenticated
}: {
    children: React.ReactNode;
    eventId: string;
    isInitiallyAuthenticated: boolean;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(isInitiallyAuthenticated);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (isAuthenticated) {
        return <>{children}</>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await verifyEventPassword(eventId, password);
        if (result.success) {
            setIsAuthenticated(true);
        } else {
            setError(result.error || "Feil passord");
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <div className={styles.iconWrapper}>
                    <Lock size={32} />
                </div>
                <h2>Passordbeskyttet</h2>
                <p>Vennligst oppgi passordet for å se dette arrangementet.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passord"
                        required
                        autoFocus
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (
                            <>
                                <span>Lås opp</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
