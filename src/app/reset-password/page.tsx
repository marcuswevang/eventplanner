"use client";

import { useState, Suspense } from "react"; // Added Suspense
import { resetPassword } from "@/app/actions";
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Component that uses useSearchParams
function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setStatus({ type: 'error', message: "Ugyldig lenke. Mangler token." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: "Passordene er ikke like." });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        const result = await resetPassword(token, newPassword);
        setIsLoading(false);

        if (result.success) {
            setStatus({ type: 'success', message: "Passordet ble endret! Du blir videresendt til logg inn..." });
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } else {
            setStatus({ type: 'error', message: result.error || "Noe gikk galt." });
        }
    };

    if (!token) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h1 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Ugyldig lenke</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Denne lenken mangler en sikkerhetskode.</p>
                <Link href="/forgot-password" className="luxury-button">Be om ny lenke</Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Lag nytt passord</h1>
                <p style={{ color: 'var(--text-muted)' }}>Skriv inn ditt nye passord nedenfor.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="password"
                        placeholder="Nytt passord"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
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
                <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="password"
                        placeholder="Bekreft nytt passord"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? <Loader2 size={20} className="spin" /> : "Oppdater passord"}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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

                {/* Wrap the component using useSearchParams in Suspense */}
                <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-muted)" }}>Laster...</div>}>
                    <ResetPasswordForm />
                </Suspense>
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
