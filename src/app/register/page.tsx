"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../login/login.module.css";
import { Lock, Mail, User, Loader2, ArrowRight } from "lucide-react";
import { registerUser } from "@/app/actions";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await registerUser(email, password, name);

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/login?registered=true");
            }
        } catch (err) {
            setError("Noe gikk galt. Vennligst prøv igjen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.decoration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
            </div>

            <div className={`${styles.card} glass`}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <User className={styles.logoIcon} size={32} />
                    </div>
                    <h1>Kom i gang</h1>
                    <p>Opprett en brukerkonto for å starte planleggingen</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Navn</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} size={20} />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ditt navn"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">E-post</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.no"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Passord</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minst 6 tegn"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? (
                            <Loader2 className="spin" size={20} />
                        ) : (
                            <>
                                <span>Opprett konto</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Har du allerede en konto? <a href="/login">Logg inn</a></p>
                </div>
            </div>
        </main>
    );
}
