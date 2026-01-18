"use client";

import { useState } from "react";
import { toggleEventStatus, activateUser, adminResetUserPassword, adminPromoteToSuperAdmin } from "@/app/actions";
import { Check, X, Search, Globe, Link as LinkIcon, Users, UserPlus, KeyRound, Save, ShieldAlert, ArrowRightCircle } from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";

interface SuperadminDashboardProps {
    initialEvents: any[];
    initialPendingUsers: any[];
    initialAllUsers: any[];
}

export default function SuperadminDashboard({ initialEvents, initialPendingUsers, initialAllUsers }: SuperadminDashboardProps) {
    const [events, setEvents] = useState(initialEvents);
    const [pendingUsers, setPendingUsers] = useState(initialPendingUsers);
    const [allUsers, setAllUsers] = useState(initialAllUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"events" | "pending" | "users">("events");
    const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { }
    });

    const openConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleToggleStatus = async (eventId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isActive: newStatus } : e));

        const result = await toggleEventStatus(eventId, newStatus);
        if (result.error) {
            alert(result.error);
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isActive: currentStatus } : e));
        }
    };

    const handleActivateUser = async (userId: string) => {
        const result = await activateUser(userId);
        if (result.success) {
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            // Also update status in allUsers if present
            setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isActivated: true } : u));
        } else {
            alert(result.error);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!newPassword) return;

        const result = await adminResetUserPassword(userId, newPassword);
        if (result.success) {
            alert("Passordet er oppdatert.");
            setResetPasswordId(null);
            setNewPassword("");
        } else {
            alert(result.error);
        }
    };

    const handlePromoteUser = async (userId: string) => {
        openConfirm(
            "Promoter bruker",
            "Er du sikker på at du vil gjøre denne brukeren til Superadmin?",
            async () => {
                const result = await adminPromoteToSuperAdmin(userId);
                if (result.success) {
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "SUPER_ADMIN" } : u));
                    alert("Bruker oppgradert til Superadmin.");
                } else {
                    alert(result.error);
                }
            }
        );
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPendingUsers = pendingUsers.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredAllUsers = allUsers.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="title-gradient">Superadmin Dashboard</h1>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button
                            onClick={() => setActiveTab("events")}
                            className={activeTab === "events" ? "active-tab" : "inactive-tab"}
                        >
                            Arrangementer ({events.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={activeTab === "pending" ? "active-tab" : "inactive-tab"}
                        >
                            Venter på aktivering ({pendingUsers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={activeTab === "users" ? "active-tab" : "inactive-tab"}
                        >
                            Alle Brukere ({allUsers.length})
                        </button>
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
                    <input
                        type="text"
                        placeholder="Søk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="sexy-input"
                    />
                </div>
            </header>

            {activeTab === "events" ? (
                <div className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.03)" }}>
                                <th style={{ padding: "1rem" }}>Navn / Slug</th>
                                <th style={{ padding: "1rem" }}>Type</th>
                                <th style={{ padding: "1rem" }}>Dato</th>
                                <th style={{ padding: "1rem" }}>Eiere</th>
                                <th style={{ padding: "1rem" }}>Gjester</th>
                                <th style={{ padding: "1rem" }}>Status</th>
                                <th style={{ padding: "1rem" }}>Handlinger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map(event => (
                                <tr key={event.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: 600 }}>{event.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <LinkIcon size={12} /> {event.slug}
                                        </div>
                                        {event.customDomain && (
                                            <div style={{ fontSize: "0.8rem", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Globe size={12} /> {event.customDomain}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem" }}>{event.type}</td>
                                    <td style={{ padding: "1rem" }}>{new Date(event.date).toLocaleDateString("no-NO")}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                            {event.users.map((u: any) => (
                                                <span key={u.email} style={{ fontSize: "0.8rem" }} title={u.email}>{u.name || u.email}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Users size={16} color="var(--text-muted)" />
                                            {event._count.guests}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            background: event.isActive ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)",
                                            color: event.isActive ? "#2ecc71" : "#e74c3c"
                                        }}>
                                            {event.isActive ? "Aktiv" : "Deaktivert"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <button
                                            onClick={() => handleToggleStatus(event.id, event.isActive)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid",
                                                borderColor: event.isActive ? "#e74c3c" : "#2ecc71",
                                                background: "transparent",
                                                color: event.isActive ? "#e74c3c" : "#2ecc71",
                                                cursor: "pointer",
                                                fontSize: "0.85rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            {event.isActive ? <X size={14} /> : <Check size={14} />}
                                            {event.isActive ? "Deaktiver" : "Aktiver"}
                                        </button>

                                        <Link
                                            href={`/admin?eventId=${event.id}`}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid var(--glass-border)",
                                                background: "rgba(255, 255, 255, 0.05)",
                                                color: "var(--text-main)",
                                                textDecoration: "none",
                                                fontSize: "0.85rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            <ArrowRightCircle size={14} />
                                            Gå til
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === "pending" ? (
                <div className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.03)" }}>
                                <th style={{ padding: "1rem" }}>Navn</th>
                                <th style={{ padding: "1rem" }}>E-post</th>
                                <th style={{ padding: "1rem" }}>Registrert</th>
                                <th style={{ padding: "1rem" }}>Handlinger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPendingUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                                        Ingen ventende brukere funnet.
                                    </td>
                                </tr>
                            ) : (
                                filteredPendingUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                        <td style={{ padding: "1rem" }}>{user.name || "-"}</td>
                                        <td style={{ padding: "1rem" }}>{user.email}</td>
                                        <td style={{ padding: "1rem" }}>{new Date(user.createdAt).toLocaleDateString("no-NO")}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <button
                                                onClick={() => handleActivateUser(user.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "1px solid var(--accent-gold)",
                                                    background: "transparent",
                                                    color: "var(--accent-gold)",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}
                                            >
                                                <UserPlus size={14} />
                                                Aktiver bruker
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.03)" }}>
                                <th style={{ padding: "1rem" }}>Navn</th>
                                <th style={{ padding: "1rem" }}>E-post</th>
                                <th style={{ padding: "1rem" }}>Rolle</th>
                                <th style={{ padding: "1rem" }}>Status</th>
                                <th style={{ padding: "1rem" }}>Handlinger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                    <td style={{ padding: "1rem" }}>{user.name || "-"}</td>
                                    <td style={{ padding: "1rem" }}>{user.email}</td>
                                    <td style={{ padding: "1rem" }}>{user.role}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            background: user.isActivated ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)",
                                            color: user.isActivated ? "#2ecc71" : "#e74c3c"
                                        }}>
                                            {user.isActivated ? "Aktiv" : "Inaktiv"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        {resetPasswordId === user.id ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input
                                                    type="text"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Nytt passord"
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        border: "1px solid var(--glass-border)",
                                                        background: "rgba(255, 255, 255, 0.1)",
                                                        color: "white",
                                                        width: "120px"
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleResetPassword(user.id)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        background: "var(--accent-gold)",
                                                        color: "black",
                                                        border: "none",
                                                        cursor: "pointer"
                                                    }}
                                                    title="Lagre passord"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setResetPasswordId(null); setNewPassword(""); }}
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        background: "rgba(255, 255, 255, 0.1)",
                                                        color: "white",
                                                        border: "none",
                                                        cursor: "pointer"
                                                    }}
                                                    title="Avbryt"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setResetPasswordId(user.id); setNewPassword(""); }}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                                    background: "transparent",
                                                    color: "var(--text-muted)",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}
                                            >
                                                <KeyRound size={14} />
                                                Nullstill passord
                                            </button>
                                        )}

                                        {user.role !== "SUPER_ADMIN" && (
                                            <button
                                                onClick={() => handlePromoteUser(user.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "1px solid var(--accent-gold)",
                                                    background: "rgba(212, 175, 55, 0.1)",
                                                    color: "var(--accent-gold)",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}
                                                title="Gjør til Superadmin"
                                            >
                                                <ShieldAlert size={14} />
                                                Promoter
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .active-tab {
                    background: var(--accent-gold);
                    color: black;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .inactive-tab {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-muted);
                    border: 1px solid var(--glass-border);
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .sexy-input {
                    padding: 0.8rem 1rem 0.8rem 2.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.6);
                    color: var(--text-main);
                    width: 300px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(4px);
                    font-size: 0.95rem;
                }
                
                :global([data-theme='dark']) .sexy-input {
                    background: rgba(0, 0, 0, 0.3);
                }

                .sexy-input:hover {
                    border-color: var(--accent-gold-soft);
                    background: rgba(255, 255, 255, 0.8);
                }

                :global([data-theme='dark']) .sexy-input:hover {
                    background: rgba(0, 0, 0, 0.4);
                }

                .sexy-input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
                    transform: translateY(-1px);
                }

                :global([data-theme='dark']) .sexy-input:focus {
                    background: #1a1a1a;
                }
            `}</style>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isDestructive={false}
            />
        </div>
    );
}
