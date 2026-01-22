"use client";

import { useState } from "react";
import styles from "@/app/admin/admin.module.css";
import { Users, LayoutDashboard, Utensils, Gift, Wallet, Camera, Settings, User, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import EventSwitcher from "@/components/EventSwitcher";

interface AdminSidebarProps {
    eventId: string;
    userId?: string;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    config?: any;
    showTesting?: boolean;
}

export default function AdminSidebar({
    eventId,
    userId,
    activeTab,
    onTabChange,
    config = {},
    showTesting = true
}: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // ... existing handleNav and NavItem ...

    // Helper to check if a feature is enabled (default to true if config is empty/undefined for backward compat)
    const isEnabled = (key: string) => {
        // If no event ID is present, hiding event-specific modules (for profile view etc)
        if (!eventId) return false;

        if (!config || Object.keys(config).length === 0) return true;
        return config[key] === true;
    };

    const handleNav = (tab: string, href: string) => {
        if (onTabChange) {
            onTabChange(tab);
        } else {
            window.location.href = href;
        }
    };

    const NavItem = ({ id, icon: Icon, label, href }: { id: string, icon: any, label: string, href?: string }) => {
        const isActive = activeTab === id;

        // Use href if provided, otherwise default to query param logic
        // If eventId matches "undefined" string or is empty, use empty string
        const safeEventId = eventId && eventId !== "undefined" ? eventId : "";

        const finalHref = href || (safeEventId ? `/admin?eventId=${safeEventId}&tab=${id}` : "#");

        const commonStyle: React.CSSProperties = {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
            background: isActive ? 'var(--glass-bg)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s',
            border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
        };

        if (href || !onTabChange) {
            return (
                <Link
                    href={finalHref}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    title={isCollapsed ? label : ""}
                    style={commonStyle}
                >
                    <Icon size={20} />
                    {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 400 }}>{label}</span>}
                </Link>
            );
        }

        return (
            <button
                onClick={() => onTabChange ? onTabChange(id) : window.location.href = finalHref}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={isCollapsed ? label : ""}
                style={commonStyle}
            >
                <Icon size={20} />
                {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 400 }}>{label}</span>}
            </button>
        );
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`} style={{ width: isCollapsed ? '80px' : '250px', transition: 'width 0.3s ease' }}>

            {!isCollapsed && userId && (
                <div className={styles.switcherWrapper}>
                    <EventSwitcher currentEventId={eventId} userId={userId} />
                </div>
            )}

            <nav className={styles.nav}>
                <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" href={eventId ? `/admin?eventId=${eventId}` : '/admin'} />

                {isEnabled('wishlistEnabled') && (
                    <NavItem id="wishlist" icon={Gift} label="Ønskeliste" />
                )}

                {isEnabled('guestsEnabled') && (
                    <NavItem id="guests" icon={Users} label="Gjester" />
                )}

                {isEnabled('budgetEnabled') && (
                    <NavItem id="budget" icon={Wallet} label="Budsjett" href={`/admin/budget?eventId=${eventId}`} />
                )}

                {isEnabled('seatingEnabled') && (
                    <>
                        <NavItem id="tables" icon={Utensils} label="Bordliste" />
                        <NavItem id="map" icon={LayoutDashboard} label="Bordoversikt" />
                    </>
                )}

                {isEnabled('galleryEnabled') && (
                    <NavItem id="gallery" icon={Camera} label="Galleri" />
                )}

                <NavItem id="settings" icon={Settings} label="Innstillinger" />

                {showTesting && isEnabled('testingEnabled') && (
                    <NavItem id="testing" icon={FlaskConical} label="Testing" />
                )}

                <div style={{ flexGrow: 1 }} />

                <NavItem id="profile" icon={User} label="Min Profil" href={eventId ? `/admin/profile?eventId=${eventId}` : "/admin/profile"} />

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={styles.navItem}
                    style={{ marginTop: 'auto', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span>Minimer meny</span>}
                </button>
            </nav>
        </aside>
    );
}
