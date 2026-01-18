"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/app/admin/admin.module.css";
import { Users, LayoutDashboard, Utensils, Gift, Trash2, Martini, Pencil, WheatOff, MilkOff, Vegan, EggOff, PlusCircle, Circle, Square, RectangleHorizontal, Check, X, StretchHorizontal, CheckSquare, Lock, Unlock, FileUp } from "lucide-react";
import AdminWishlistForm from "@/components/AdminWishlistForm";
import AdminGuestForm from "@/components/AdminGuestForm";
import { deleteGuest, deleteWishlistItem, createTable, deleteTable, updateTable, batchCreateTables, deleteTables, importGuests } from "@/app/actions";

interface AdminDashboardProps {
    eventId: string;
    guests: any[];
    items: any[];
    songs: any[];
    tables: any[];
}

type Tab = 'dashboard' | 'wishlist' | 'guests' | 'tables' | 'map';

export default function AdminDashboard({ eventId, guests, items, songs, tables }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACCEPTED" | "DECLINED" | "PENDING">("ALL");

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
        if (confirm(`Er du sikker på at du vil slette "${name}"?`)) {
            await deleteGuest(id);
            if (editingGuest?.id === id) setEditingGuest(null);
        }
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
                // Batch creation
                // Extract number if present
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

    const startEditingTable = (table: any) => {
        setEditingTable(table);
        setNewTableName(table.name);
        setNewTableCapacity(table.capacity);
        setNewTableShape(table.shape);
        setNewTableCount(1);
    };

    const cancelEditTable = () => {
        setEditingTable(null);
        setNewTableName("");
        setNewTableCapacity(8);
        setNewTableShape("ROUND");
        setNewTableCount(1);
    };
    const handleDeleteTable = async (id: string) => {
        if (confirm("Er du sikker på at du vil slette dette bordet?")) {
            await deleteTable(id);
        }
    };

    const handleDeleteWishlist = async (id: string, title: string) => {
        if (confirm(`Er du sikker på at du vil slette "${title}"?`)) {
            await deleteWishlistItem(id);
        }
    };

    const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
        if (activeTab !== 'map') return;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
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

        const newPos = { ...tablePositionsRef.current[draggingId], x, y };

        // Update ref immediately for mouseUp to read
        tablePositionsRef.current = {
            ...tablePositionsRef.current,
            [draggingId]: newPos
        };

        setTablePositions(prev => ({
            ...prev,
            [draggingId]: newPos
        }));
    };

    const handleMouseUp = async (e: React.MouseEvent) => {
        if (draggingId) {
            // Read from ref to get the absolute latest position from the drag
            const pos = tablePositionsRef.current[draggingId];

            if (pos) {
                // Optimistically update localTables
                setLocalTables(prev => prev.map(t =>
                    t.id === draggingId ? { ...t, x: Math.round(pos.x), y: Math.round(pos.y) } : t
                ));

                await updateTable(draggingId, { x: Math.round(pos.x), y: Math.round(pos.y) });
            }
            setDraggingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>Admin-konsoll</div>
                <nav className={styles.nav}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('wishlist')}
                        className={`${styles.navItem} ${activeTab === 'wishlist' ? styles.active : ''}`}
                    >
                        <Gift size={20} />
                        <span>Ønskeliste</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('guests')}
                        className={`${styles.navItem} ${activeTab === 'guests' ? styles.active : ''}`}
                    >
                        <Users size={20} />
                        <span>Gjester</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`${styles.navItem} ${activeTab === 'tables' ? styles.active : ''}`}
                    >
                        <Utensils size={20} />
                        <span>Bordliste</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Bordoversikt</span>
                    </button>
                </nav>
            </aside>

            <main className={styles.main}>
                {activeTab === 'dashboard' && (
                    <>
                        <header className={styles.header}>
                            <h1>Oversikt</h1>
                        </header>

                        <section className={styles.stats}>
                            <div className={`${styles.statCard} glass`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h3>Gjester</h3>
                                <p className={styles.statValue}>{guests.length}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--accent-green)' }}>✅ {guests.filter((g: any) => g.rsvpStatus === 'ACCEPTED').length} Bekreftet</span>
                                    <span style={{ color: '#ff4444' }}>❌ {guests.filter((g: any) => g.rsvpStatus === 'DECLINED').length} Avslått</span>
                                    <span style={{ color: 'var(--accent-gold)' }}>⏳ {guests.filter((g: any) => g.rsvpStatus === 'PENDING').length} Uavklart</span>
                                </div>
                            </div>
                            <div className={`${styles.statCard} glass`}>
                                <h3>Ønsker kjøpt</h3>
                                <p className={styles.statValue}>
                                    {items.filter((i: any) => i.isPurchased).length} / {items.length}
                                </p>
                            </div>
                            <div className={`${styles.statCard} glass`}>
                                <h3>Sanger i kø</h3>
                                <p className={styles.statValue}>{songs.length}</p>
                            </div>
                        </section>
                    </>
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
                                    <div className={`${styles.tableCard} glass`} style={{ gridColumn: '1 / -1' }}>
                                        {/* Search and Filters inside Card */}
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
                                                <button onClick={() => setStatusFilter("ALL")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'ALL' ? 'var(--text-main)' : 'transparent', color: statusFilter === 'ALL' ? 'var(--bg-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>Alle</button>
                                                <button onClick={() => setStatusFilter("ACCEPTED")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'ACCEPTED' ? 'var(--accent-green)' : 'transparent', color: statusFilter === 'ACCEPTED' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>Kommer</button>
                                                <button onClick={() => setStatusFilter("DECLINED")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'DECLINED' ? '#e74c3c' : 'transparent', color: statusFilter === 'DECLINED' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>Kan ikke</button>
                                                <button onClick={() => setStatusFilter("PENDING")} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: statusFilter === 'PENDING' ? 'var(--accent-gold)' : 'transparent', color: statusFilter === 'PENDING' ? '#000' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>Uavklart</button>
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
                                                                    <strong>{guest.name}</strong>
                                                                    {guest.type === 'DINNER' ? (
                                                                        <>
                                                                            <Utensils size={14} style={{ color: 'var(--accent-gold)' }} />
                                                                            <Martini size={14} style={{ color: 'var(--accent-gold)' }} />
                                                                        </>
                                                                    ) : (
                                                                        <Martini size={14} style={{ color: 'var(--accent-gold)' }} />
                                                                    )}
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
                                                            {guest.allergies && (
                                                                <div style={{ fontSize: '0.8rem', color: '#e67e22', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                                                                    {(() => {
                                                                        const parts = guest.allergies.split(/,\s*/);
                                                                        const icons: React.ReactNode[] = [];
                                                                        const text: string[] = [];

                                                                        parts.forEach((part: string) => {
                                                                            const p = part.trim();
                                                                            if (p === 'Gluten') icons.push(<span key="gluten" title="Gluten" style={{ cursor: 'help' }}><WheatOff size={18} /></span>);
                                                                            else if (p === 'Laktose') icons.push(<span key="laktose" title="Laktose" style={{ cursor: 'help' }}><MilkOff size={18} /></span>);
                                                                            else if (p === 'Vegetar') icons.push(<span key="vegetar" title="Vegetar" style={{ cursor: 'help' }}><Vegan size={18} /></span>);
                                                                            else if (p === 'Egg') icons.push(<span key="egg" title="Egg" style={{ cursor: 'help' }}><EggOff size={18} /></span>);
                                                                            else if (p) text.push(p);
                                                                        });

                                                                        return (
                                                                            <>
                                                                                {icons}
                                                                                {text.length > 0 && <span>{text.join(', ')}</span>}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                            <div style={{ fontSize: '0.8rem', color: guest.rsvpStatus === 'ACCEPTED' ? 'var(--accent-green)' : guest.rsvpStatus === 'DECLINED' ? '#e74c3c' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                <span>{guest.rsvpStatus === 'ACCEPTED' ? '✅ Bekreftet' : guest.rsvpStatus === 'DECLINED' ? '❌ Kommer ikke' : '⏳ Venter svar'}</span>
                                                                {guest.role && <span style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>• {guest.role}</span>}
                                                                {guest.mobile && <span style={{ color: 'var(--text-muted)' }}>• 📱 {guest.mobile}</span>}
                                                                {guest.table && <span style={{ color: 'var(--text-muted)' }}>• Bord: {guest.table.name}</span>}
                                                                {guest.partner && <span style={{ color: 'var(--text-muted)' }}>• Partner: {guest.partner.name}</span>}
                                                            </div>
                                                            {guest.address && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', marginLeft: '2px' }}>📍 {guest.address}</div>}
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
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {isSelectionMode && selectedTableIds.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Er du sikker på at du vil slette ${selectedTableIds.length} bord?`)) {
                                                await deleteTables(selectedTableIds);
                                                setSelectedTableIds([]);
                                                setIsSelectionMode(false);
                                            }
                                        }}
                                        style={{ color: '#ff4444', background: 'rgba(255, 68, 68, 0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Slett valgte ({selectedTableIds.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(!isSelectionMode);
                                        setSelectedTableIds([]);
                                    }}
                                    style={{ color: 'var(--text-main)', background: 'rgba(255, 255, 255, 0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {isSelectionMode ? <X size={16} /> : <CheckSquare size={16} />}
                                    {isSelectionMode ? 'Avbryt valg' : 'Velg flere'}
                                </button>
                            </div>
                        </header>

                        <form onSubmit={handleCreateTable} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Navn på bord {newTableCount > 1 ? '(Prefix - e.g "Bord")' : ''}</label>
                                <input
                                    type="text"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    placeholder={newTableCount > 1 ? "Eks: Bord" : "Eks: Bord 1"}
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
                            {!editingTable && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '80px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Antall</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={newTableCount}
                                        onChange={(e) => setNewTableCount(parseInt(e.target.value) || 1)}
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
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '80px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Plasser</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newTableCapacity}
                                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 1)}
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Form</label>
                                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                                    <button type="button" onClick={() => setNewTableShape("ROUND")} style={{ background: newTableShape === 'ROUND' ? 'var(--accent-gold)' : 'transparent', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: newTableShape === 'ROUND' ? '#000' : 'var(--text-muted)' }} title="Rundt"><Circle size={20} /></button>
                                    <button type="button" onClick={() => setNewTableShape("SQUARE")} style={{ background: newTableShape === 'SQUARE' ? 'var(--accent-gold)' : 'transparent', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: newTableShape === 'SQUARE' ? '#000' : 'var(--text-muted)' }} title="Firkantet"><Square size={20} /></button>
                                    <button type="button" onClick={() => setNewTableShape("RECTANGLE")} style={{ background: newTableShape === 'RECTANGLE' ? 'var(--accent-gold)' : 'transparent', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: newTableShape === 'RECTANGLE' ? '#000' : 'var(--text-muted)' }} title="Rektangulært"><RectangleHorizontal size={20} /></button>
                                    <button type="button" onClick={() => setNewTableShape("LONG")} style={{ background: newTableShape === 'LONG' ? 'var(--accent-gold)' : 'transparent', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: newTableShape === 'LONG' ? '#000' : 'var(--text-muted)' }} title="Langbord (Hovedbord)"><StretchHorizontal size={20} /></button>
                                </div>
                            </div>

                            {editingTable && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTable.isLocked || false}
                                                onChange={async (e) => {
                                                    const newLocked = e.target.checked;
                                                    setEditingTable({ ...editingTable, isLocked: newLocked });
                                                    // Also update immediate state for map view
                                                    setTablePositions(prev => ({
                                                        ...prev,
                                                        [editingTable.id]: { ...prev[editingTable.id], isLocked: newLocked }
                                                    }));
                                                }}
                                                style={{ accentColor: 'var(--accent-gold)' }}
                                            />
                                            Låst
                                        </label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (confirm("Vil du nullstille posisjonen til dette bordet?")) {
                                                    await updateTable(editingTable.id, { x: 0, y: 0 });
                                                    setTablePositions(prev => ({
                                                        ...prev,
                                                        [editingTable.id]: { ...prev[editingTable.id], x: 0, y: 0 }
                                                    }));
                                                    alert("Posisjon nullstilt!");
                                                }
                                            }}
                                            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
                                        >
                                            Nullstill posisjon
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--accent-gold)',
                                    color: '#000',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}>
                                    {editingTable ? <Check size={20} /> : <PlusCircle size={20} />}
                                    {editingTable ? "Lagre" : "Legg til"}
                                </button>
                                {editingTable && (
                                    <button type="button" onClick={cancelEditTable} style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className={styles.tableGrid}>
                            {localTables.length === 0 ? (
                                <p className={styles.empty}>Ingen bord er definert ennå.</p>
                            ) : (
                                localTables.map((table: any) => (
                                    <div
                                        key={table.id}
                                        className={`${styles.tableCard} glass`}
                                        style={{
                                            position: 'relative',
                                            border: isSelectionMode && selectedTableIds.includes(table.id) ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                                            cursor: isSelectionMode ? 'pointer' : 'default',
                                            transform: isSelectionMode && selectedTableIds.includes(table.id) ? 'scale(1.02)' : 'scale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                if (selectedTableIds.includes(table.id)) {
                                                    setSelectedTableIds(prev => prev.filter(id => id !== table.id));
                                                } else {
                                                    setSelectedTableIds(prev => [...prev, table.id]);
                                                }
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {isSelectionMode && (
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        border: '2px solid var(--text-muted)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: selectedTableIds.includes(table.id) ? 'var(--accent-gold)' : 'transparent',
                                                        borderColor: selectedTableIds.includes(table.id) ? 'var(--accent-gold)' : 'var(--text-muted)'
                                                    }}>
                                                        {selectedTableIds.includes(table.id) && <Check size={14} color="#000" />}
                                                    </div>
                                                )}
                                                {table.shape === 'SQUARE' ? <Square size={24} color="var(--accent-gold)" /> : table.shape === 'RECTANGLE' ? <RectangleHorizontal size={24} color="var(--accent-gold)" /> : table.shape === 'LONG' ? <StretchHorizontal size={24} color="var(--accent-gold)" /> : <Circle size={24} color="var(--accent-gold)" />}
                                                <div>
                                                    <h3>{table.name}</h3>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maks {table.capacity} pers</span>
                                                </div>
                                            </div>
                                            {!isSelectionMode && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => {
                                                            const currentPos = tablePositionsRef.current[table.id] || {};
                                                            startEditingTable({ ...table, ...currentPos });
                                                        }}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                                                        title="Rediger bord"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTable(table.id)}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4444', padding: '0.2rem' }}
                                                        title="Slett bord"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <ul className={styles.guestList}>
                                            {table.guests.map((guest: any) => (
                                                <li key={guest.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                    <span>{guest.name}</span>
                                                    {guest.allergies && (
                                                        <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                                            {guest.allergies.includes('Gluten') && <span title="Gluten"><WheatOff size={14} color="#e67e22" /></span>}
                                                            {guest.allergies.includes('Laktose') && <span title="Laktose"><MilkOff size={14} color="#e67e22" /></span>}
                                                            {guest.allergies.includes('Vegetar') && <span title="Vegetar"><Vegan size={14} color="#4caf50" /></span>}
                                                            {guest.allergies.includes('Egg') && <span title="Egg"><EggOff size={14} color="#e67e22" /></span>}
                                                            {/* Show a small dot for other allergies if any remain after removing known ones */}
                                                            {guest.allergies.split(',').some((a: string) => !['Gluten', 'Laktose', 'Vegetar', 'Egg'].includes(a.trim()) && a.trim() !== '') && (
                                                                <span style={{ fontSize: '10px', color: '#e67e22', cursor: 'help', border: '1px solid #e67e22', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={guest.allergies}>!</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>{table.guests.length} / {table.capacity}</span>
                                            <span style={{ color: table.guests.length > table.capacity ? '#e74c3c' : table.guests.length === table.capacity ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                                {table.guests.length > table.capacity ? 'Overbooket!' : table.guests.length === table.capacity ? 'Fullt' : 'Ledig'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'map' && (
                    <section className={styles.seating} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <header className={styles.header}>
                            <h1>Bordoversikt</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Dra og slipp bordene for å organisere rommet. Dobbeltklikk for å rotere.</p>
                        </header>

                        <div
                            className="glass"
                            style={{
                                flex: 1,
                                position: 'relative',
                                overflow: 'auto',
                                borderRadius: '16px',
                                border: '1px solid var(--glass-border)',
                                cursor: draggingId ? 'grabbing' : 'default'
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <div style={{ minWidth: '100%', minHeight: '100%', width: '3000px', height: '2000px', position: 'relative' }}>
                                {localTables.map((table: any) => {
                                    const pos = tablePositions[table.id] || { x: 0, y: 0 };
                                    const isRound = table.shape === 'ROUND';
                                    const isRect = table.shape === 'RECTANGLE';
                                    const isLong = table.shape === 'LONG';
                                    const size = isLong ? { w: 300, h: 80 } : isRect ? { w: 160, h: 80 } : { w: 100, h: 100 };
                                    const rotation = (pos as any).rotation ?? table.rotation ?? 0;
                                    const isLocked = (pos as any).isLocked ?? table.isLocked ?? false;

                                    return (
                                        <div
                                            key={table.id}
                                            onMouseDown={(e) => {
                                                if (!isLocked) handleMouseDown(e, table.id);
                                            }}
                                            onDoubleClick={async () => {
                                                if (isLocked) return; // Prevent rotation if locked

                                                // Read current rotation from ref to avoid closure staleness
                                                const currentPos = tablePositionsRef.current[table.id] || {};
                                                const currentRotation = (currentPos as any).rotation ?? table.rotation ?? 0;
                                                const newRotation = (currentRotation + 45) % 360;

                                                // Update local state immediately
                                                const newPos = { ...currentPos, rotation: newRotation };

                                                tablePositionsRef.current = {
                                                    ...tablePositionsRef.current,
                                                    [table.id]: newPos
                                                };

                                                setTablePositions(prev => ({
                                                    ...prev,
                                                    [table.id]: newPos
                                                }));

                                                setLocalTables(prev => prev.map(t =>
                                                    t.id === table.id ? { ...t, rotation: newRotation } : t
                                                ));

                                                await updateTable(table.id, { rotation: newRotation });
                                            }}
                                            title={isLocked ? "Bordet er låst" : "Dobbeltklikk for å rotere, dra for å flytte"}
                                            style={{
                                                position: 'absolute',
                                                left: pos.x,
                                                top: pos.y,
                                                width: size.w,
                                                height: size.h,
                                                borderRadius: isRound ? '50%' : '8px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                border: isLocked ? '1px dashed var(--text-muted)' : '1px solid var(--accent-gold)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: isLocked ? 'default' : 'grab',
                                                userSelect: 'none',
                                                zIndex: draggingId === table.id ? 10 : 1,
                                                boxShadow: draggingId === table.id ? '0 10px 20px rgba(0,0,0,0.3)' : 'none',
                                                transition: draggingId === table.id ? 'none' : 'box-shadow 0.2s, transform 0.3s',
                                                color: 'var(--text-main)',
                                                transform: `rotate(${rotation}deg)`
                                            }}
                                        >
                                            {/* Lock Icon */}
                                            <div
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onDoubleClick={(e) => e.stopPropagation()}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    // Use current locked state from ref to avoid closure issues
                                                    const currentPos = tablePositionsRef.current[table.id] || {};
                                                    const currentLocked = (currentPos as any).isLocked ?? table.isLocked ?? false;
                                                    const newLocked = !currentLocked;

                                                    const newPos = { ...currentPos, isLocked: newLocked };
                                                    tablePositionsRef.current = {
                                                        ...tablePositionsRef.current,
                                                        [table.id]: newPos
                                                    };

                                                    setTablePositions(prev => ({
                                                        ...prev,
                                                        [table.id]: newPos
                                                    }));

                                                    setLocalTables(prev => prev.map(t =>
                                                        t.id === table.id ? { ...t, isLocked: newLocked } : t
                                                    ));

                                                    await updateTable(table.id, { isLocked: newLocked });
                                                }}
                                                title={isLocked ? "Lås opp" : "Lås bordet"}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-12px',
                                                    right: '-12px',
                                                    background: 'var(--background-main)',
                                                    borderRadius: '50%',
                                                    padding: '4px',
                                                    border: '1px solid var(--glass-border)',
                                                    cursor: 'pointer',
                                                    zIndex: 20,
                                                    transform: `rotate(${-rotation}deg)` // Keep icon upright
                                                }}
                                            >
                                                {isLocked ? <Lock size={12} color="var(--text-muted)" /> : <Unlock size={12} color="var(--accent-gold)" />}
                                            </div>

                                            <div style={{ transform: `rotate(${-rotation}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{table.name}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{table.guests.length}/{table.capacity}</span>
                                            </div>
                                            {isLong && (
                                                <div style={{ position: 'absolute', bottom: '4px', left: 0, right: 0, display: 'flex', justifyContent: 'space-evenly', padding: '0 10px' }}>
                                                    {Array.from({ length: Math.min(table.capacity, 15) }).map((_, i) => (
                                                        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
