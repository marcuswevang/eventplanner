"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import styles from "@/app/auth.module.css"; // Reuse auth styles if available

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        const result = await requestPasswordReset(email);
        setIsLoading(false);

        if (result.success) {
            // We show success even if email doesn't exist for security (though our action currently returns success blindly)
            setStatus({
                type: 'success',
                message: "Om e-postadressen eksisterer, har vi sendt deg en lenke for å tilbakestille passordet. Sjekk konsollen (demo)."
            });
        } else {
            setStatus({ type: 'error', message: result.error || "Noe gikk galt." });
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '1rem'
        }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '16px' }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} />
                    Tilbake til logg inn
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Glemt Passord?</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="email"
                            placeholder="Din e-postadresse"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {status && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: status.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: status.type === 'success' ? '#2ecc71' : '#e74c3c',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.8rem',
                            fontSize: '0.9rem'
                        }}>
                            {status.type === 'success' ? <CheckCircle size={20} style={{ flexShrink: 0 }} /> : <AlertCircle size={20} style={{ flexShrink: 0 }} />}
                            <span>{status.message}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="luxury-button"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                    >
                        {isLoading ? <Loader2 size={20} className="spin" /> : "Send lenke"}
                    </button>
                </form>
            </div>
            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}
