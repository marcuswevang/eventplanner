"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
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
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Feil e-post eller passord.");
            } else {
                router.push("/admin");
                router.refresh();
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
                        <Lock className={styles.logoIcon} size={32} />
                    </div>
                    <h1>Velkommen tilbake</h1>
                    <p>Logg inn for å administrere arrangementet ditt</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
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
                                placeholder="••••••••"
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
                                <span>Logg inn</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Har du ikke en konto? <a href="/register">Registrer deg</a></p>
                </div>
            </div>
        </main>
    );
}
