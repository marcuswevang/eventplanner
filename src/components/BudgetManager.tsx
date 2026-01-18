"use client";

import { useState, useMemo } from "react";
import styles from "@/app/admin/budget/BudgetManager.module.css";
import { Trash2, Pencil, Calendar, Settings, ChevronDown, Check, X, Filter, LogOut, Plus, Search, AlertCircle, ArrowUpRight, ArrowDownRight, AlertTriangle, DollarSign, PieChart, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { createBudgetItem, updateBudgetItem, deleteBudgetItem, updateEventSettings } from "@/app/actions";
import ConfirmationModal from "@/components/ConfirmationModal";

interface BudgetItem {
    id: string;
    description: string;
    category: string;
    estimatedCost: number;
    actualCost: number | null;
    isPaid: boolean;
}

interface BudgetMetricSettings {
    showBudgetGoal: boolean;
    showEstimated: boolean;
    showActual: boolean;
    showPaid: boolean;
    showDistribution: boolean;
    showDeviation: boolean;
}

const DEFAULT_METRICS: BudgetMetricSettings = {
    showBudgetGoal: true,
    showEstimated: true,
    showActual: true,
    showPaid: true,
    showDistribution: true,
    showDeviation: true
};

type SortField = "description" | "category" | "estimatedCost" | "actualCost" | "isPaid";
type SortDirection = "asc" | "desc";
type FilterStatus = "ALL" | "PAID" | "UNPAID";

export default function BudgetManager({
    eventId,
    initialItems,
    initialBudgetGoal,
    initialConfig
}: {
    eventId: string;
    initialItems: BudgetItem[];
    initialBudgetGoal: number;
    initialConfig?: any;
}) {
    const [items, setItems] = useState<BudgetItem[]>(initialItems);
    const [budgetGoal, setBudgetGoal] = useState(initialBudgetGoal);

    // Visibility State
    const [metrics, setMetrics] = useState<BudgetMetricSettings>(() => {
        return initialConfig?.budgetMetrics ? { ...DEFAULT_METRICS, ...initialConfig.budgetMetrics } : DEFAULT_METRICS;
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Sorting & Filtering State
    const [sortField, setSortField] = useState<SortField>("category");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

    const toggleMetric = async (key: keyof BudgetMetricSettings) => {
        const newMetrics = { ...metrics, [key]: !metrics[key] };
        setMetrics(newMetrics);
        // Persist
        await updateEventSettings(eventId, {
            config: {
                ...initialConfig,
                budgetMetrics: newMetrics
            }
        });
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedAndFilteredItems = useMemo(() => {
        let filtered = items;

        if (filterStatus === "PAID") {
            filtered = filtered.filter(i => i.isPaid);
        } else if (filterStatus === "UNPAID") {
            filtered = filtered.filter(i => !i.isPaid);
        }

        return filtered.sort((a, b) => {
            let valA: any = a[sortField];
            let valB: any = b[sortField];

            // Handle potential nulls for actualCost
            if (sortField === "actualCost") {
                valA = valA ?? -1;
                valB = valB ?? -1;
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [items, sortField, sortDirection, filterStatus]);

    const [isAdding, setIsAdding] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [newCategory, setNewCategory] = useState("Annet");
    const [newEstimated, setNewEstimated] = useState("");
    const [newIsPaid, setNewIsPaid] = useState(false);

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Goal Editing
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState("");

    // Item Editing
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ description: string, category: string, estimatedCost: string, actualCost: string }>({
        description: "",
        category: "Annet",
        estimatedCost: "",
        actualCost: ""
    });

    const handleUpdateGoal = async () => {
        const goal = parseFloat(tempGoal) || 0;
        setBudgetGoal(goal);
        setIsEditingGoal(false);
        await updateEventSettings(eventId, { budgetGoal: goal } as any);
    };

    const startEditingGoal = () => {
        setTempGoal(budgetGoal.toString());
        setIsEditingGoal(true);
    };

    const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    const totalActual = items.reduce((sum, item) => {
        // If actualCost is set (not null/undefined), use it.
        // If actualCost is NOT set, use estimatedCost as fallback.
        const costToUse = (item.actualCost !== null && item.actualCost !== undefined)
            ? item.actualCost
            : (item.estimatedCost || 0);
        return sum + costToUse;
    }, 0);
    const totalPaid = items.filter(i => i.isPaid).reduce((sum, item) => {
        const costToUse = (item.actualCost !== null && item.actualCost !== undefined)
            ? item.actualCost
            : (item.estimatedCost || 0);
        return sum + costToUse;
    }, 0);

    // New Metrics
    const diffGoalEstimated = budgetGoal - totalEstimated; // "Gjenstående til fordeling"
    const diffActualEstimated = totalActual - totalEstimated; // "Avvik (Faktisk - Estimert)"

    const progress = budgetGoal > 0 ? Math.min((totalActual / budgetGoal) * 100, 100) : 0;
    const isOverBudget = budgetGoal > 0 && totalActual > budgetGoal;

    // Dynamic Categories
    const defaultCategories = ["Lokale", "Mat & Drikke", "Antrekk", "Blomster", "Fotograf", "Musikk", "Transport", "Annet"];
    const usedCategories = new Set(items.map(i => i.category));
    defaultCategories.forEach(c => usedCategories.add(c));
    const allCategories = Array.from(usedCategories).sort();

    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [isEditingCustomCategory, setIsEditingCustomCategory] = useState(false);

    // Category Selector Component inside for shared scope or pass props
    const CategorySelector = ({
        value,
        onChange,
        isCustom,
        onCustomChange,
        onCustomCancel
    }: {
        value: string,
        onChange: (cat: string) => void,
        isCustom: boolean,
        onCustomChange: (val: string) => void,
        onCustomCancel?: () => void
    }) => {
        if (isCustom) {
            return (
                <div className={styles.customCategoryInputWrapper}>
                    <input
                        type="text"
                        placeholder="Ny kategori..."
                        value={value}
                        onChange={e => onCustomChange(e.target.value)}
                        className={styles.customCategoryInput}
                        autoFocus
                    />
                    {onCustomCancel && <button type="button" onClick={onCustomCancel} className={styles.iconButton}><X size={16} /></button>}
                </div>
            );
        }

        return (
            <div className={styles.categoryList}>
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        className={`${styles.categoryPill} ${value === cat ? styles.selected : ""}`}
                        onClick={() => onChange(cat)}
                    >
                        {cat}
                    </button>
                ))}
                <button
                    type="button"
                    className={`${styles.categoryPill} ${styles.addCategoryPill}`}
                    onClick={() => onCustomChange("__NEW__")}
                >
                    +
                </button>
            </div>
        );
    };

    const handleCategorySelect = (cat: string) => {
        setNewCategory(cat);
        setIsCustomCategory(false);
    };

    const handleCustomCategoryInput = (val: string) => {
        if (val === "__NEW__") {
            setIsCustomCategory(true);
            setNewCategory("");
        } else {
            setNewCategory(val);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createBudgetItem(eventId, newDescription, newCategory, parseFloat(newEstimated) || 0, newIsPaid);
        if (result.success) {
            setNewDescription("");
            setNewEstimated("");
            setNewCategory("Annet");
            setNewIsPaid(false);
            // In a real app we'd refresh or the action would return the item
            // For now, simple reload/refresh mindset
            window.location.reload();
        }
    };

    const handleTogglePaid = async (item: BudgetItem) => {
        const result = await updateBudgetItem(item.id, { isPaid: !item.isPaid });
        if (result.success) {
            setItems(items.map(i => i.id === item.id ? { ...i, isPaid: !i.isPaid } : i));
        }
    };

    const handleUpdateActual = async (id: string, value: string) => {
        // If empty string, set to null (remove cost)
        const cost = value === "" ? null : (parseFloat(value) || 0);
        const result = await updateBudgetItem(id, { actualCost: cost });
        if (result.success) {
            setItems(items.map(i => i.id === id ? { ...i, actualCost: cost } : i));
        }
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const result = await deleteBudgetItem(itemToDelete);

        if (result.success) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete));
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } else {
            alert("Kunne ikke slette budsjettposten: " + (result.error || "Ukjent feil"));
            // Keep modal open so user can try again or cancel
        }
    };

    const startEditingItem = (item: BudgetItem) => {
        setEditingItemId(item.id);
        setIsEditingCustomCategory(false);
        setEditValues({
            description: item.description,
            category: item.category,
            estimatedCost: item.estimatedCost.toString(),
            actualCost: item.actualCost ? item.actualCost.toString() : ""
        });
    };

    const cancelEditingItem = () => {
        setEditingItemId(null);
        setIsEditingCustomCategory(false);
    };

    const handleSaveItem = async () => {
        if (!editingItemId) return;

        const est = parseFloat(editValues.estimatedCost) || 0;
        const act = editValues.actualCost ? parseFloat(editValues.actualCost) : 0; // Or null if strictly needed

        const result = await updateBudgetItem(editingItemId, {
            description: editValues.description,
            category: editValues.category,
            estimatedCost: est,
            actualCost: editValues.actualCost ? act : undefined // Assuming undefined/null is handled for clearing via update? Update usually partial.
        });

        if (result.success) {
            setItems(items.map(i => i.id === editingItemId ? {
                ...i,
                description: editValues.description,
                category: editValues.category,
                estimatedCost: est,
                actualCost: editValues.actualCost ? act : null
            } : i));
            setEditingItemId(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.overview}>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', position: 'relative' }}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={styles.iconButton}
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                        <Settings size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Visning</span>
                        <ChevronDown size={14} />
                    </button>

                    {isSettingsOpen && (
                        <div className="glass" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            zIndex: 10,
                            padding: '1rem',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            width: '240px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-soft)'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Velg nøkkeltall</h4>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showBudgetGoal} onChange={() => toggleMetric('showBudgetGoal')} /> Budsjettmål
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showEstimated} onChange={() => toggleMetric('showEstimated')} /> Estimert totalt
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showActual} onChange={() => toggleMetric('showActual')} /> Faktisk kostnad
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showPaid} onChange={() => toggleMetric('showPaid')} /> Betalt
                            </label>
                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showDistribution} onChange={() => toggleMetric('showDistribution')} /> Til fordeling
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={metrics.showDeviation} onChange={() => toggleMetric('showDeviation')} /> Avvik
                            </label>
                        </div>
                    )}
                </div>

                {metrics.showBudgetGoal && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <DollarSign size={20} />
                            <span>Budsjettmål</span>
                            {!isEditingGoal && (
                                <button onClick={startEditingGoal} className={styles.iconButton} title="Endre mål">
                                    <Pencil size={14} />
                                </button>
                            )}
                        </div>
                        {isEditingGoal ? (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <input
                                    type="number"
                                    className={styles.goalInput}
                                    value={tempGoal}
                                    onChange={e => setTempGoal(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleUpdateGoal} className={styles.iconButton}><Check size={18} /></button>
                                <button onClick={() => setIsEditingGoal(false)} className={styles.iconButton}><X size={18} /></button>
                            </div>
                        ) : (
                            <div className={styles.cardValue}>
                                {budgetGoal.toLocaleString()} kr
                            </div>
                        )}
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: isOverBudget ? "#e74c3c" : "#2ecc71"
                                }}
                            />
                        </div>
                    </div>
                )}

                {metrics.showEstimated && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <PieChart size={20} />
                            <span>Estimert totalt</span>
                        </div>
                        <div className={styles.cardValue}>{totalEstimated.toLocaleString()} kr</div>
                    </div>
                )}

                {metrics.showActual && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <TrendingUp size={20} />
                            <span>Faktisk kostnad</span>
                        </div>
                        <div className={styles.cardValue} style={{ color: isOverBudget ? "#e74c3c" : "inherit" }}>
                            {totalActual.toLocaleString()} kr
                        </div>
                    </div>
                )}

                {metrics.showPaid && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <Check size={20} />
                            <span>Betalt</span>
                        </div>
                        <div className={styles.cardValue}>{totalPaid.toLocaleString()} kr</div>
                    </div>
                )}

                {/* New Cards for Differences */}
                {metrics.showDistribution && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <DollarSign size={20} />
                            <span>Til fordeling</span>
                        </div>
                        <div className={styles.cardValue} style={{ color: diffGoalEstimated < 0 ? "#e74c3c" : "#2ecc71" }}>
                            {diffGoalEstimated.toLocaleString()} kr
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Mål - Estimert</span>
                    </div>
                )}

                {metrics.showDeviation && (
                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <AlertCircle size={20} />
                            <span>Avvik</span>
                        </div>
                        <div className={styles.cardValue} style={{ color: diffActualEstimated > 0 ? "#e74c3c" : "#2ecc71" }}>
                            {diffActualEstimated > 0 ? "+" : ""}{diffActualEstimated.toLocaleString()} kr
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Faktisk - Estimert</span>
                    </div>
                )}
            </div>

            <div className={`${styles.mainList} glass`}>
                <div className={styles.listHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Budsjettposter</h2>

                        {/* Filter Controls */}
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '2px', borderRadius: '8px' }}>
                            <button
                                onClick={() => setFilterStatus("ALL")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    background: filterStatus === "ALL" ? 'var(--card-bg)' : 'transparent',
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: filterStatus === "ALL" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    color: filterStatus === "ALL" ? 'var(--text-main)' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Filter size={14} />
                                Alle
                            </button>
                            <button
                                onClick={() => setFilterStatus("UNPAID")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    background: filterStatus === "UNPAID" ? 'var(--card-bg)' : 'transparent',
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: filterStatus === "UNPAID" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    color: filterStatus === "UNPAID" ? 'var(--text-main)' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <div className={styles.circle} style={{ width: '10px', height: '10px', border: '1px solid currentColor' }} />
                                Ubetalt
                            </button>
                            <button
                                onClick={() => setFilterStatus("PAID")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    background: filterStatus === "PAID" ? 'var(--card-bg)' : 'transparent',
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: filterStatus === "PAID" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    color: filterStatus === "PAID" ? 'var(--text-main)' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Check size={14} />
                                Betalt
                            </button>
                        </div>
                    </div>
                    <button className={styles.addButton} onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? <X size={20} /> : <Plus size={20} />}
                        <span>{isAdding ? "Avbryt" : "Legg til"}</span>
                    </button>
                </div>

                {isAdding && (
                    <form className={styles.addForm} onSubmit={handleAdd}>
                        <input
                            type="text"
                            placeholder="Beskrivelse (f.eks. Catering)"
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            required
                        />
                        <div style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>Velg kategori:</label>
                            <CategorySelector
                                value={newCategory}
                                onChange={handleCategorySelect}
                                isCustom={isCustomCategory}
                                onCustomChange={handleCustomCategoryInput}
                                onCustomCancel={() => setIsCustomCategory(false)}
                            />
                        </div>
                        <input
                            type="number"
                            placeholder="Estimert kostnad"
                            value={newEstimated}
                            onChange={e => setNewEstimated(e.target.value)}
                            required
                        />
                        {/* Toggle for IS PAID in Add Form */}
                        <button
                            type="button"
                            className={`${styles.paidToggle} ${newIsPaid ? styles.isPaid : ""}`}
                            onClick={() => setNewIsPaid(!newIsPaid)}
                            style={{ gridColumn: "span 1", justifySelf: "start" }}
                        >
                            {newIsPaid ? <Check size={16} /> : <div className={styles.circle} />}
                            <span>{newIsPaid ? "Betalt" : "Ubetalt"}</span>
                        </button>

                        <button type="submit">Lagre</button>
                    </form>
                )}

                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th onClick={() => handleSort("description")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Beskrivelse
                                    {sortField === "description" && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </div>
                            </th>
                            <th onClick={() => handleSort("category")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Kategori
                                    {sortField === "category" && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </div>
                            </th>
                            <th onClick={() => handleSort("estimatedCost")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Estimert
                                    {sortField === "estimatedCost" && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </div>
                            </th>
                            <th onClick={() => handleSort("actualCost")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Faktisk
                                    {sortField === "actualCost" && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </div>
                            </th>
                            <th onClick={() => handleSort("isPaid")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Status
                                    {sortField === "isPaid" && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </div>
                            </th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                        {sortedAndFilteredItems.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.empty}>Ingen budsjettposter funnet.</td>
                            </tr>
                        )}
                        {sortedAndFilteredItems.map(item => (
                            <tr key={item.id} className={styles.row}>
                                {editingItemId === item.id ? (
                                    <>
                                        <td>
                                            <input
                                                value={editValues.description}
                                                onChange={e => setEditValues({ ...editValues, description: e.target.value })}
                                                className={styles.editInput}
                                                autoFocus
                                            />
                                        </td>
                                        <td>
                                            <div style={{ position: "relative" }}>
                                                {isEditingCustomCategory ? (
                                                    <div className={styles.customCategoryInputWrapper}>
                                                        <input
                                                            value={editValues.category}
                                                            onChange={e => setEditValues({ ...editValues, category: e.target.value })}
                                                            className={styles.editInput}
                                                            placeholder="Ny kategori..."
                                                            autoFocus
                                                        />
                                                        <button onClick={() => setIsEditingCustomCategory(false)} className={styles.iconButton}><X size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.miniCategoryList}>
                                                        {allCategories.map(cat => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => setEditValues({ ...editValues, category: cat })}
                                                                className={`${styles.miniPill} ${editValues.category === cat ? styles.selected : ""}`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => { setIsEditingCustomCategory(true); setEditValues({ ...editValues, category: "" }); }}
                                                            className={`${styles.miniPill} ${styles.addCategoryPill}`}
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editValues.estimatedCost}
                                                onChange={e => setEditValues({ ...editValues, estimatedCost: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editValues.actualCost}
                                                onChange={e => setEditValues({ ...editValues, actualCost: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.paidToggle} ${item.isPaid ? styles.isPaid : ""}`}
                                                onClick={() => {
                                                    // Optimistically toggle locally directly for the edit view
                                                    // But we want to persist it? 
                                                    // If we are in "Edit Mode" for the row, usually we expect "Save" to persist.
                                                    // But the toggle in the read-only view persists immediately.
                                                    // Let's make this also persist immediately for consistency, 
                                                    // OR make it part of the editValues state.
                                                    // Given the user said "not possible to set as unpaid", they might want instant feedback.
                                                    // Let's use the handleTogglePaid logic here too.
                                                    handleTogglePaid(item);
                                                }}
                                                title={item.isPaid ? "Klikk for å markere som ubetalt" : "Klikk for å markere som betalt"}
                                            >
                                                {item.isPaid ? <Check size={16} /> : <div className={styles.circle} />}
                                                <span>{item.isPaid ? "Betalt" : "Ubetalt"}</span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button onClick={handleSaveItem} className={styles.iconButton}><Check size={16} /></button>
                                                <button onClick={cancelEditingItem} className={styles.iconButton}><X size={16} /></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className={styles.description}>{item.description}</td>
                                        <td className={styles.category}>{item.category}</td>
                                        <td className={styles.amount}>{item.estimatedCost.toLocaleString()} kr</td>
                                        <td>
                                            <div className={styles.costContainer} title="Klikk for å endre faktisk kostnad">
                                                <input
                                                    type="text"
                                                    defaultValue={item.actualCost ? item.actualCost.toString() : ""}
                                                    placeholder="-"
                                                    className={styles.quickInput}
                                                    onBlur={(e) => handleUpdateActual(item.id, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            (e.target as HTMLInputElement).blur();
                                                        }
                                                    }}
                                                />
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>kr</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.paidToggle} ${item.isPaid ? styles.isPaid : ""}`}
                                                onClick={() => handleTogglePaid(item)}
                                                title={item.isPaid ? "Klikk for å markere som ubetalt" : "Klikk for å markere som betalt"}
                                            >
                                                {item.isPaid ? <Check size={16} /> : <div className={styles.circle} />}
                                                <span>{item.isPaid ? "Betalt" : "Ubetalt"}</span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.iconButton} onClick={() => startEditingItem(item)} title="Endre alt">
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    title="Slett"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Slett budsjettpost"
                message="Er du sikker på at du vil slette denne posten? Dette kan ikke angres."
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                isDestructive={true}
            />
        </div>
    );
}
