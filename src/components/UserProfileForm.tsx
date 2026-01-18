"use client";

import { useState } from "react";
import { updateUserProfile, updateUserPassword } from "@/app/actions";
import { User, Lock, Check, AlertCircle, Loader2 } from "lucide-react";

interface UserProfileFormProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setProfileStatus(null);

        const result = await updateUserProfile({ name, email });
        setIsUpdatingProfile(false);

        if (result.success) {
            setProfileStatus({ type: 'success', message: "Profilen ble oppdatert!" });
        } else {
            setProfileStatus({ type: 'error', message: result.error || "Kunne ikke oppdatere profil." });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: 'error', message: "Nye passord samsvarer ikke." });
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordStatus(null);

        const result = await updateUserPassword({ currentPassword, newPassword });
        setIsUpdatingPassword(false);

        if (result.success) {
            setPasswordStatus({ type: 'success', message: "Passordet ble oppdatert!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            setPasswordStatus({ type: 'error', message: result.error || "Kunne ikke oppdatere passord." });
        }
    };

    return (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
            {/* Profile Section */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px' }}>
                        <User size={24} color="var(--accent-gold)" />
                    </div>
                    <h2 style={{ margin: 0 }}>Profilinnstillinger</h2>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Navn</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>E-post</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    {profileStatus && (
                        <div style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            background: profileStatus.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: profileStatus.type === 'success' ? '#2ecc71' : '#e74c3c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {profileStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                            {profileStatus.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="luxury-button"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {isUpdatingProfile ? <Loader2 size={18} className="spin" /> : null}
                        Lagre profil
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px' }}>
                        <Lock size={24} color="var(--accent-gold)" />
                    </div>
                    <h2 style={{ margin: 0 }}>Endre passord</h2>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nåværende passord</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nytt passord</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bekreft nytt passord</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    {passwordStatus && (
                        <div style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            background: passwordStatus.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: passwordStatus.type === 'success' ? '#2ecc71' : '#e74c3c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {passwordStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                            {passwordStatus.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="luxury-button"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {isUpdatingPassword ? <Loader2 size={18} className="spin" /> : null}
                        Oppdater passord
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
        </div>
    );
}
