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

    const NavItem = ({ id, icon: Icon, label, href, isAction = false }: any) => {
        // Special case for Budget which is always a separate page for now
        if (id === 'budget' && !href) href = `/admin/budget?eventId=${eventId}`;

        // Determine if active
        const isActive = activeTab === id;

        // If we have an onTabChange, we prefer clicking to switch tabs, UNLESS it's a separate page (Budget, Settings/Profile)
        const isExternal = id === 'budget' || id === 'profile';

        const handleClick = (e: React.MouseEvent) => {
            if (!isExternal && onTabChange) {
                e.preventDefault();
                onTabChange(id);
            }
            // If external, let the Link or window.location handle it
        };

        const content = (
            <>
                <Icon size={20} style={{ minWidth: '20px' }} />
                {!isCollapsed && <span>{label}</span>}
            </>
        );

        const commonStyle = {
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.8rem 0' : '0.8rem 1rem'
        };

        if (isExternal || !onTabChange) {
            // Use Link for external or if no callback provided
            // For dashboard links when on Budget page, we want them to go to /admin?eventId=...&tab=...
            const finalHref = href || `/admin?eventId=${eventId}&tab=${id}`;
            return (
                <Link
                    href={finalHref}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    title={isCollapsed ? label : ""}
                    style={commonStyle}
                >
                    {content}
                </Link>
            );
        }

        return (
            <button
                onClick={handleClick}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={isCollapsed ? label : ""}
                style={commonStyle}
            >
                {content}
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
                <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />

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

                {showTesting && (
                    <NavItem id="testing" icon={FlaskConical} label="Testing" />
                )}

                <div style={{ flexGrow: 1 }} />

                <NavItem id="profile" icon={User} label="Min Profil" href="/settings" />

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
