"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/app/admin/admin.module.css";
import { Users, LayoutDashboard, Utensils, Gift, Trash2, Martini, Pencil, WheatOff, MilkOff, Vegan, EggOff, PlusCircle, Circle, Square, RectangleHorizontal, Check, X, StretchHorizontal, CheckSquare, Lock, Unlock, FileUp, FileDown, DollarSign, Menu, Crown, UserRound, Star, Sparkles, Mic2, UtensilsCrossed, Heart, Camera, Settings, Wallet } from "lucide-react";
import AdminWishlistForm from "@/components/AdminWishlistForm";
import AdminGuestForm from "@/components/AdminGuestForm";
import BudgetManager from "@/components/BudgetManager";
import AdminSettings from "@/components/AdminSettings";
import GalleryUploader from "@/components/GalleryUploader";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmationModal from "@/components/ConfirmationModal";
import Modal from "@/components/Modal";
import { deleteGuest, deleteWishlistItem, createTable, deleteTable, updateTable, batchCreateTables, deleteTables, importGuests, exportGuestsAction, deleteGalleryItem, updateEventSettings } from "@/app/actions";

interface AdminDashboardProps {
    eventId: string;
    userId: string;
    guests: any[];
    items: any[];
    songs: any[];
    tables: any[];
    galleryItems: any[];
    budgetItems: any[];
    budgetGoal: number;
    config?: any;
    eventSettings?: any;
    event?: any;
    initialTab?: Tab;
}

type Tab = 'dashboard' | 'wishlist' | 'guests' | 'tables' | 'map' | 'budget' | 'gallery' | 'settings';

export default function AdminDashboard({
    eventId,
    userId,
    guests,
    items,
    songs,
    tables,
    galleryItems,
    budgetItems,
    budgetGoal,
    config,
    eventSettings,
    event,
    initialTab = 'dashboard'
}: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<any>(null);
    const [newTableName, setNewTableName] = useState("");
    const [newTableCapacity, setNewTableCapacity] = useState(8);
    const [newTableShape, setNewTableShape] = useState("ROUND");
    const [newTableCount, setNewTableCount] = useState(1);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [localTables, setLocalTables] = useState<any[]>(tables);
    const [tablePositions, setTablePositions] = useState<{ [key: string]: { x: number, y: number, rotation: number, isLocked: boolean } }>({});
    const tablePositionsRef = useRef<{ [key: string]: { x: number, y: number, rotation: number, isLocked: boolean } }>({});
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importData, setImportData] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACCEPTED" | "DECLINED" | "PENDING">("ALL");

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

    useEffect(() => {
        setLocalTables(tables);
        const positions: any = {};
        tables.forEach((t: any) => {
            positions[t.id] = { x: t.x || 0, y: t.y || 0, rotation: t.rotation || 0, isLocked: t.isLocked || false };
        });
        setTablePositions(positions);
        tablePositionsRef.current = positions;
    }, [tables]);

    const handleDeleteGuest = async (id: string, name: string) => {
        openConfirm(
            "Slett gjest",
            `Er du sikker på at du vil slette "${name}"?`,
            async () => {
                await deleteGuest(id);
                if (editingGuest?.id === id) setEditingGuest(null);
            }
        );
    };

    const handleCreateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableName.trim()) return;

        let result;

        if (editingTable) {
            result = await updateTable(editingTable.id, {
                name: newTableName,
                capacity: newTableCapacity,
                shape: newTableShape
            });
            if (result.success) {
                setEditingTable(null);
                setNewTableName("");
                setNewTableCapacity(8);
                setNewTableShape("ROUND");
                setNewTableCount(1);
            }
        } else {
            if (newTableCount > 1) {
                const match = newTableName.match(/^(.*?)(\d+)$/);
                let prefix = newTableName.trim();
                let startNumber = 1;

                if (match) {
                    prefix = match[1].trim();
                    startNumber = parseInt(match[2]);
                }

                result = await batchCreateTables(eventId, prefix, startNumber, newTableCount, newTableCapacity, newTableShape as any);
            } else {
                result = await createTable(eventId, newTableName, newTableCapacity, newTableShape as any);
            }

            if (result.success) {
                setNewTableName("");
                setNewTableCapacity(8);
                setNewTableShape("ROUND");
                setNewTableCount(1);
            }
        }

        if (result && !result.success) {
            alert(result.error);
        }
    };

    const handleDeleteTable = async (id: string) => {
        openConfirm(
            "Slett bord",
            "Er du sikker på at du vil slette dette bordet?",
            async () => {
                await deleteTable(id);
            }
        );
    };

    const handleDeleteWishlist = async (id: string, title: string) => {
        openConfirm(
            "Slett ønske",
            `Er du sikker på at du vil slette "${title}"?`,
            async () => {
                await deleteWishlistItem(id);
            }
        );
    };

    const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
        if (activeTab !== 'map') return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setDraggingId(tableId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId) return;

        const container = e.currentTarget as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const x = e.clientX - containerRect.left + container.scrollLeft - dragOffset.current.x;
        const y = e.clientY - containerRect.top + container.scrollTop - dragOffset.current.y;

        const oldPos = tablePositionsRef.current[draggingId];
        if (!oldPos) return;

        const deltaX = x - oldPos.x;
        const deltaY = y - oldPos.y;

        const idsToMove = selectedTableIds.includes(draggingId) ? selectedTableIds : [draggingId];
        const newTablePositions = { ...tablePositionsRef.current };

        idsToMove.forEach(id => {
            const tablePos = newTablePositions[id];
            if (tablePos && !tablePos.isLocked) {
                newTablePositions[id] = {
                    ...tablePos,
                    x: id === draggingId ? x : tablePos.x + deltaX,
                    y: id === draggingId ? y : tablePos.y + deltaY
                };
            }
        });

        tablePositionsRef.current = newTablePositions;
        setTablePositions(newTablePositions);
    };

    const handleMouseUp = async (e: React.MouseEvent) => {
        if (draggingId) {
            const idsToMove = selectedTableIds.includes(draggingId) ? selectedTableIds : [draggingId];

            setLocalTables(prev => prev.map(t => {
                const pos = tablePositionsRef.current[t.id];
                if (idsToMove.includes(t.id) && pos) {
                    return { ...t, x: Math.round(pos.x), y: Math.round(pos.y) };
                }
                return t;
            }));

            const promises = idsToMove.map(id => {
                const pos = tablePositionsRef.current[id];
                if (pos) {
                    return updateTable(id, { x: Math.round(pos.x), y: Math.round(pos.y) });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            setDraggingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <AdminSidebar
                eventId={eventId}
                userId={userId}
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as Tab)}
                config={config}
            />

            <main className={styles.main}>
                {activeTab === 'dashboard' && (
                    <>
                        <header className={styles.header}>
                            <h1>Oversikt</h1>
                        </header>

                        <section className={styles.stats}>
                            <button
                                onClick={() => setActiveTab('guests')}
                                className={`${styles.statCard} glass`}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.03)', textAlign: 'center', width: '100%' }}
                            >
                                <h3>Gjester</h3>
                                <p className={styles.statValue}>{guests.length}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--accent-green)' }}>✅ {guests.filter((g: any) => g.rsvpStatus === 'ACCEPTED').length} Bekreftet</span>
                                    <span style={{ color: '#ff4444' }}>❌ {guests.filter((g: any) => g.rsvpStatus === 'DECLINED').length} Avslått</span>
                                    <span style={{ color: 'var(--accent-gold)' }}>⏳ {guests.filter((g: any) => g.rsvpStatus === 'PENDING').length} Uavklart</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`${styles.statCard} glass`}
                                style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.03)', width: '100%' }}
                            >
                                <h3>Ønsker kjøpt</h3>
                                <p className={styles.statValue}>
                                    {items.filter((i: any) => i.isPurchased).length} / {items.length}
                                </p>
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`${styles.statCard} glass`}
                                style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.03)', width: '100%' }}
                            >
                                <h3>Bilder i galleri</h3>
                                <p className={styles.statValue}>{galleryItems.length}</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('budget')}
                                className={`${styles.statCard} glass`}
                                style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.03)', width: '100%' }}
                            >
                                <h3>Budsjett</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <p className={styles.statValue}>{budgetItems.reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0).toLocaleString()} kr</p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>av {budgetGoal.toLocaleString()} kr mål</span>
                                </div>
                            </button>
                        </section>
                    </>
                )}

                {activeTab === 'gallery' && (
                    <section className={styles.wishlistSection}>
                        <header className={styles.header}>
                            <h1>Bildegalleri</h1>
                        </header>
                        <GalleryUploader eventId={eventId} />

                        <div style={{ marginTop: '3rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Opplastede bilder</h2>
                            <div className={styles.tableGrid}>
                                {galleryItems.map((item: any) => (
                                    <div key={item.id} className={`${styles.tableCard} glass`} style={{ position: 'relative', padding: '0.5rem' }}>
                                        <button
                                            onClick={() => openConfirm("Slett bilde", "Er du sikker på at du vil slette dette bildet?", () => deleteGalleryItem(item.id))}
                                            style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: 'rgba(0,0,0,0.5)',
                                                border: 'none',
                                                color: '#ff4444',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                zIndex: 1
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <img
                                            src={item.url}
                                            alt={item.caption || "Bilde"}
                                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        {item.caption && (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                                {item.caption}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'budget' && (
                    <section className={styles.budgetSection}>
                        <header className={styles.header}>
                            <h1>Budsjettstyring</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Hold kontroll på utgifter og betalinger.</p>
                        </header>
                        <BudgetManager
                            eventId={eventId}
                            initialItems={budgetItems}
                            initialBudgetGoal={budgetGoal}
                            initialConfig={config}
                        />
                    </section>
                )}

                {activeTab === 'wishlist' && (
                    <section className={styles.wishlistSection} style={{ marginTop: 0 }}>
                        <header className={styles.header}>
                            <h1>Administrer Ønskeliste</h1>
                        </header>
                        <AdminWishlistForm eventId={eventId} />

                        <div style={{ marginTop: '3rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Registrerte Ønsker</h2>
                            <div className={styles.tableGrid}>
                                {items.map((item: any) => (
                                    <div key={item.id} className={`${styles.tableCard} glass`} style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => handleDeleteWishlist(item.id, item.title)}
                                            style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff4444',
                                                cursor: 'pointer'
                                            }}
                                            title="Slett ønske"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )}
                                            <h3 style={{ margin: 0, border: 'none', padding: 0 }}>{item.title}</h3>
                                        </div>
                                        {item.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.description}</p>}
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                                                Lenke
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'guests' && (
                    <section className={styles.seating}>
                        <header className={styles.header}>
                            <h1>Alle Gjester</h1>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    title="Importer Gjesteliste"
                                    style={{
                                        padding: '0.6rem',
                                        borderRadius: '50%',
                                        border: '1px solid var(--accent-gold)',
                                        background: 'transparent',
                                        color: 'var(--accent-gold)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FileUp size={20} />
                                </button>
                                <button
                                    onClick={async () => {
                                        setIsExporting(true);
                                        const res = await exportGuestsAction(eventId);
                                        setIsExporting(false);
                                        if (res.error) {
                                            alert(res.error);
                                        } else if (res.excel) {
                                            const binaryString = window.atob(res.excel);
                                            const bytes = new Uint8Array(binaryString.length);
                                            for (let i = 0; i < binaryString.length; i++) {
                                                bytes[i] = binaryString.charCodeAt(i);
                                            }
                                            const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                            const link = document.createElement("a");
                                            const url = URL.createObjectURL(blob);
                                            link.setAttribute("href", url);
                                            link.setAttribute("download", `gjesteliste_${new Date().toISOString().split('T')[0]}.xlsx`);
                                            link.style.visibility = 'hidden';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }
                                    }}
                                    disabled={isExporting}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '1px solid var(--accent-gold)',
                                        background: 'transparent',
                                        color: 'var(--accent-gold)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        opacity: isExporting ? 0.5 : 1
                                    }}
                                    title="Eksporter gjesteliste"
                                >
                                    <FileDown size={20} />
                                </button>
                            </div>
                        </header>

                        {isImportModalOpen && (
                            <div className={styles.modalOverlay} style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div className={`${styles.modal} glass`} style={{ width: '600px', maxWidth: '90vw', padding: '2rem' }}>
                                    <h2>Importer Gjester</h2>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        Lim inn gjester med formatet:<br />
                                        <strong>Navn, Mobil, Adresse, Relasjon</strong><br />
                                        (Støtter komma, semikolon eller tab som skilletegn)
                                    </p>
                                    <textarea
                                        value={importData}
                                        onChange={(e) => setImportData(e.target.value)}
                                        placeholder={`Ola Nordmann, 99887766, Storgata 1, Brudgommens Far\nKari Nordmann; 44556677; Storgata 1; Brudgommens Mor`}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            color: 'var(--text-main)',
                                            padding: '1rem',
                                            marginBottom: '1rem',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button
                                            onClick={() => setIsImportModalOpen(false)}
                                            style={{ padding: '0.8rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            Avbryt
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const res = await importGuests(eventId, importData);
                                                if (res.error) alert(res.error);
                                                else {
                                                    alert(`Importerte ${res.count} gjester!`);
                                                    setIsImportModalOpen(false);
                                                    setImportData("");
                                                }
                                            }}
                                            style={{
                                                padding: '0.8rem 2rem',
                                                background: 'var(--accent-gold)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#000',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Importer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: '0 0 320px' }}>
                                <AdminGuestForm
                                    eventId={eventId}
                                    initialData={editingGuest}
                                    tables={tables}
                                    guests={guests}
                                    onCancel={() => setEditingGuest(null)}
                                    onSuccess={() => setEditingGuest(null)}
                                />
                            </div>
                            <div className={styles.tableGrid} style={{ flex: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                                {guests.length === 0 ? (
                                    <p className={styles.empty}>Ingen gjester registrert.</p>
                                ) : (
                                    <div className={`${styles.tableCard} glass`} style={{ gridColumn: '1 / -1', overflowX: 'auto' }}>
                                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Søk på navn..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.8rem 1rem 0.8rem 2.5rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--glass-border)',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        color: 'var(--text-main)'
                                                    }}
                                                />
                                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                                                <button onClick={() => setStatusFilter("ALL")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'ALL' ? '#d4af37' : 'transparent', color: statusFilter === 'ALL' ? '#000' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 500 }}>Alle</button>
                                                <button onClick={() => setStatusFilter("ACCEPTED")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'ACCEPTED' ? '#2ecc71' : 'transparent', color: statusFilter === 'ACCEPTED' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 500 }}>Kommer</button>
                                                <button onClick={() => setStatusFilter("DECLINED")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'DECLINED' ? '#e74c3c' : 'transparent', color: statusFilter === 'DECLINED' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 500 }}>Kan ikke</button>
                                                <button onClick={() => setStatusFilter("PENDING")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'PENDING' ? '#d4af37' : 'transparent', color: statusFilter === 'PENDING' ? '#000' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 500 }}>Uavklart</button>
                                            </div>
                                        </div>

                                        {guests.filter(g => {
                                            const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesFilter = statusFilter === 'ALL' || g.rsvpStatus === statusFilter;
                                            return matchesSearch && matchesFilter;
                                        }).length === 0 ? (
                                            <p className={styles.empty}>Ingen gjester funnet.</p>
                                        ) : (
                                            <ul className={styles.guestList} style={{ columns: 2 }}>
                                                {guests
                                                    .filter(g => {
                                                        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
                                                        const matchesFilter = statusFilter === 'ALL' || g.rsvpStatus === statusFilter;
                                                        return matchesSearch && matchesFilter;
                                                    })
                                                    .map((guest: any) => (
                                                        <li key={guest.id} style={{ marginBottom: '0.5rem', paddingRight: '1rem', breakInside: 'avoid' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    {(() => {
                                                                        const role = guest.role?.trim();
                                                                        if (role === 'Brud') return <Heart size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        if (role === 'Brudgom') return <Crown size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        if (role === 'Forlover (Brud)') return <Star size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        if (role === 'Forlover (Brudgom)') return <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        if (role === 'Toastmaster') return <Mic2 size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        if (role === 'Takk for maten') return <UtensilsCrossed size={18} style={{ color: 'var(--accent-gold)' }} />;
                                                                        return null;
                                                                    })()}
                                                                    <strong>{guest.name}</strong>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button
                                                                        onClick={() => setEditingGuest(guest)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                                        title="Rediger"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4444' }}
                                                                        title="Slett"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: guest.rsvpStatus === 'ACCEPTED' ? 'var(--accent-green)' : guest.rsvpStatus === 'DECLINED' ? '#e74c3c' : 'var(--text-muted)' }}>
                                                                {guest.rsvpStatus === 'ACCEPTED' ? '✅ Bekreftet' : guest.rsvpStatus === 'DECLINED' ? '❌ Kommer ikke' : '⏳ Venter svar'}
                                                                {guest.role && <span> • {guest.role}</span>}
                                                            </div>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'tables' && (
                    <section className={styles.seating}>
                        <header className={styles.header}>
                            <h1>Bordliste</h1>
                        </header>
                        <form onSubmit={handleCreateTable} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Navn på bord</label>
                                <input
                                    type="text"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    placeholder="Eks: Bord 1"
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-main)',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.8rem 2rem',
                                    background: 'var(--accent-gold)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#000',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {editingTable ? "Oppdater" : "Opprett"}
                            </button>
                        </form>

                        <div className={styles.tableGrid}>
                            {localTables.map(table => (
                                <div key={table.id} className={`${styles.tableCard} glass`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0 }}>{table.name}</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleDeleteTable(table.id)} style={{ border: 'none', background: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Kapasitet: {table.capacity}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'map' && (
                    <section className={styles.seating} style={{ height: 'calc(100vh - 150px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <header className={styles.header} style={{ marginBottom: '1rem' }}>
                            <h1>Bordoversikt</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Dra og slipp bord for å planlegge lokalet.</p>
                        </header>
                        <div
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                position: 'relative',
                                overflow: 'auto',
                                cursor: draggingId ? 'grabbing' : 'auto'
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {localTables.map(table => (
                                <div
                                    key={table.id}
                                    onMouseDown={(e) => handleMouseDown(e, table.id)}
                                    style={{
                                        position: 'absolute',
                                        left: tablePositions[table.id]?.x || 0,
                                        top: tablePositions[table.id]?.y || 0,
                                        width: '100px',
                                        height: '100px',
                                        background: 'var(--accent-gold)',
                                        color: '#000',
                                        borderRadius: table.shape === 'ROUND' ? '50%' : '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'grab',
                                        userSelect: 'none',
                                        fontWeight: 700,
                                        zIndex: draggingId === table.id ? 10 : 1
                                    }}
                                >
                                    {table.name}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'settings' && (
                    <section className={styles.settingsSection}>
                        <header className={styles.header}>
                            <h1>Innstillinger</h1>
                        </header>
                        <AdminSettings
                            eventId={eventId}
                            initialEventSettings={eventSettings}
                            guests={guests}
                        />
                    </section>
                )}
            </main>
        </div>
    );
}
