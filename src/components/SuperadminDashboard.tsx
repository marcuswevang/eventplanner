"use client";

import { useState } from "react";
import { toggleEventStatus, activateUser, adminResetUserPassword, adminPromoteToSuperAdmin, addAdminToEvent } from "@/app/actions";
import styles from "@/app/admin/admin.module.css";
import { Check, X, Search, Globe, Link as LinkIcon, Users, UserPlus, KeyRound, Save, ShieldAlert, ArrowRightCircle, Info, Calendar, Layout } from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";
import AdminSidebar from "./AdminSidebar";

interface SuperadminDashboardProps {
    initialEvents: any[];
    initialPendingUsers: any[];
    initialAllUsers: any[];
    userId: string;
    userRole: string;
}

export default function SuperadminDashboard({
    initialEvents,
    initialPendingUsers,
    initialAllUsers,
    userId,
    userRole
}: SuperadminDashboardProps) {
    const [events, setEvents] = useState(initialEvents);
    const [pendingUsers, setPendingUsers] = useState(initialPendingUsers);
    const [allUsers, setAllUsers] = useState(initialAllUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"events" | "pending" | "users">("events");
    const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [linkingUser, setLinkingUser] = useState<any>(null);
    const [selectedEventId, setSelectedEventId] = useState("");

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

    const handleLinkUserToEvent = async () => {
        if (!linkingUser || !selectedEventId) return;
        const res = await addAdminToEvent(selectedEventId, linkingUser.email);
        if (res.success) {
            alert(res.message || "Bruker knyttet til arrangement!");
            setLinkingUser(null);
            setSelectedEventId("");
            // Ideally we should revalidate or update state here, but revalidatePath in server actions should handle it if this were a server component or if we reload.
            // For now, let's just refresh the window or wait for the user to refresh.
            window.location.reload();
        } else {
            alert(res.error);
        }
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
        <div className={styles.adminContainer} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
            <AdminSidebar
                eventId=""
                userId={userId}
                userRole={userRole}
                activeTab="superadmin"
                onTabChange={() => { }}
                config={{}}
                showTesting={false}
            />

            <main id="main-content" style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
                                                <button
                                                    onClick={() => handleToggleStatus(event.id, event.isActive)}
                                                    className={event.isActive ? "luxury-button-outline" : "luxury-button-soft"}
                                                    style={{
                                                        padding: "0.5rem 1rem",
                                                        fontSize: "0.85rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        borderColor: event.isActive ? "#e74c3c" : "var(--accent-gold)",
                                                        color: event.isActive ? "#e74c3c" : "var(--accent-gold)",
                                                        background: event.isActive ? "rgba(231, 76, 60, 0.1)" : "rgba(212, 175, 55, 0.1)"
                                                    }}
                                                >
                                                    {event.isActive ? <X size={14} /> : <Check size={14} />}
                                                    {event.isActive ? "Deaktiver" : "Aktiver"}
                                                </button>

                                                <Link
                                                    href={`/admin?eventId=${event.id}`}
                                                    className="luxury-button-secondary"
                                                    style={{
                                                        marginTop: "0.5rem",
                                                        padding: "0.5rem 1rem",
                                                        fontSize: "0.85rem",
                                                        textDecoration: "none",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px"
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
                                                        className="luxury-button"
                                                        style={{
                                                            padding: "0.5rem 1rem",
                                                            fontSize: "0.85rem"
                                                        }}
                                                    >
                                                        <UserPlus size={14} style={{ marginRight: '6px' }} />
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
                                        <th style={{ padding: "1rem" }}>Arrangementer</th>
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
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                    {user.events && user.events.length > 0 ? (
                                                        user.events.map((e: any, i: number) => (
                                                            <span key={i} style={{
                                                                fontSize: "0.75rem",
                                                                background: "rgba(255, 255, 255, 0.1)",
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                color: "var(--text-muted)"
                                                            }}>
                                                                {e.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>Ingen</span>
                                                    )}
                                                </div>
                                            </td>
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
                                                                padding: "0.4rem 0.8rem",
                                                                borderRadius: "8px",
                                                                border: "1px solid var(--glass-border)",
                                                                background: "rgba(255, 255, 255, 0.1)",
                                                                color: "white",
                                                                width: "140px"
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleResetPassword(user.id)}
                                                            className="luxury-button"
                                                            style={{ padding: "0.4rem 0.8rem" }}
                                                            title="Lagre"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setResetPasswordId(null); setNewPassword(""); }}
                                                            className="luxury-button-ghost"
                                                            style={{ padding: "0.4rem 0.8rem", color: "#e74c3c" }}
                                                            title="Avbryt"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => { setResetPasswordId(user.id); setNewPassword(""); }}
                                                            className="luxury-button-ghost"
                                                            style={{
                                                                padding: "0.5rem 1rem",
                                                                fontSize: "0.85rem"
                                                            }}
                                                        >
                                                            <KeyRound size={14} style={{ marginRight: '4px' }} />
                                                            Nullstill
                                                        </button>

                                                        {user.role !== "SUPER_ADMIN" && (
                                                            <button
                                                                onClick={() => handlePromoteUser(user.id)}
                                                                className="luxury-button-outline"
                                                                style={{
                                                                    padding: "0.5rem 1rem",
                                                                    fontSize: "0.85rem"
                                                                }}
                                                                title="Gjør til Superadmin"
                                                            >
                                                                <ShieldAlert size={14} style={{ marginRight: '4px' }} />
                                                                Promoter
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setLinkingUser(user)}
                                                            className="luxury-button-secondary"
                                                            style={{
                                                                padding: "0.5rem 1rem",
                                                                fontSize: "0.85rem",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "4px"
                                                            }}
                                                            title="Knytt til arrangement"
                                                        >
                                                            <LinkIcon size={14} />
                                                            Knytt
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {linkingUser && (
                        <div className="modal-overlay" style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div className="glass" style={{ width: '450px', padding: '2rem', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px' }}>
                                        <LinkIcon size={24} color="var(--accent-gold)" />
                                    </div>
                                    <h2 style={{ margin: 0 }}>Knytt til arrangement</h2>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Velg hvilket arrangement <strong>{linkingUser.name || linkingUser.email}</strong> skal administrere.
                                </p>
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    className="sexy-input"
                                    style={{ width: '100%', marginBottom: '1.5rem' }}
                                >
                                    <option value="">Velg et arrangement...</option>
                                    {events.map((e: any) => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.slug})</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button
                                        onClick={() => setLinkingUser(null)}
                                        className="luxury-button-ghost"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        onClick={handleLinkUserToEvent}
                                        disabled={!selectedEventId}
                                        className="luxury-button"
                                    >
                                        Lagre kobling
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .active-tab {
                    background: var(--accent-gold);
                    color: black;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: 600;
                    font-family: var(--font-serif);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
                }
                .inactive-tab {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--glass-border);
                    padding: 0.8rem 1.5rem;
                    border-radius: 30px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .inactive-tab:hover {
                    border-color: var(--accent-gold);
                    color: var(--text-main);
                }

                .sexy-input {
                    padding: 0.8rem 1rem 0.8rem 2.5rem;
                    border-radius: 30px;
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
