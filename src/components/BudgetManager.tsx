"use client";

import { useState } from "react";
import styles from "@/app/admin/budget/BudgetManager.module.css";
import { Plus, Trash2, Check, X, DollarSign, PieChart, TrendingUp, AlertCircle } from "lucide-react";
import { createBudgetItem, updateBudgetItem, deleteBudgetItem } from "@/app/actions";

interface BudgetItem {
    id: string;
    description: string;
    category: string;
    estimatedCost: number;
    actualCost: number | null;
    isPaid: boolean;
}

export default function BudgetManager({
    eventId,
    initialItems
}: {
    eventId: string;
    initialItems: BudgetItem[];
}) {
    const [items, setItems] = useState<BudgetItem[]>(initialItems);
    const [isAdding, setIsAdding] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [newCategory, setNewCategory] = useState("Annet");
    const [newEstimated, setNewEstimated] = useState("");

    const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
    const totalPaid = items.reduce((sum, item) => sum + (item.isPaid ? (item.actualCost || item.estimatedCost) : 0), 0);

    const categories = ["Lokale", "Mat & Drikke", "Antrekk", "Blomster", "Fotograf", "Musikk", "Transport", "Annet"];

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createBudgetItem(eventId, newDescription, newCategory, parseFloat(newEstimated) || 0);
        if (result.success) {
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
        const cost = parseFloat(value) || 0;
        await updateBudgetItem(id, { actualCost: cost });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Er du sikker?")) {
            const result = await deleteBudgetItem(id);
            if (result.success) {
                setItems(items.filter(i => i.id !== id));
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.overview}>
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <PieChart size={20} />
                        <span>Estimert totalt</span>
                    </div>
                    <div className={styles.cardValue}>{totalEstimated.toLocaleString()} kr</div>
                </div>
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <TrendingUp size={20} />
                        <span>Faktisk kostnad</span>
                    </div>
                    <div className={styles.cardValue}>{totalActual.toLocaleString()} kr</div>
                </div>
                <div className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <Check size={20} />
                        <span>Betalt</span>
                    </div>
                    <div className={styles.cardValue}>{totalPaid.toLocaleString()} kr</div>
                </div>
            </div>

            <div className={`${styles.mainList} glass`}>
                <div className={styles.listHeader}>
                    <h2>Budsjettposter</h2>
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
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="number"
                            placeholder="Estimert kostnad"
                            value={newEstimated}
                            onChange={e => setNewEstimated(e.target.value)}
                            required
                        />
                        <button type="submit">Lagre</button>
                    </form>
                )}

                <div className={styles.table}>
                    <div className={styles.tableHead}>
                        <span>Beskrivelse</span>
                        <span>Kategori</span>
                        <span>Estimert</span>
                        <span>Faktisk</span>
                        <span>Status</span>
                        <span></span>
                    </div>
                    <div className={styles.tableBody}>
                        {items.length === 0 && <div className={styles.empty}>Ingen budsjettposter ennå.</div>}
                        {items.map(item => (
                            <div key={item.id} className={styles.row}>
                                <span className={styles.description}>{item.description}</span>
                                <span className={styles.category}>{item.category}</span>
                                <span className={styles.amount}>{item.estimatedCost.toLocaleString()} kr</span>
                                <input
                                    type="number"
                                    className={styles.actualInput}
                                    defaultValue={item.actualCost || ""}
                                    onBlur={e => handleUpdateActual(item.id, e.target.value)}
                                    placeholder="Sett faktisk"
                                />
                                <button
                                    className={`${styles.paidToggle} ${item.isPaid ? styles.isPaid : ""}`}
                                    onClick={() => handleTogglePaid(item)}
                                >
                                    {item.isPaid ? <Check size={16} /> : <div className={styles.circle} />}
                                    <span>{item.isPaid ? "Betalt" : "Ubetalt"}</span>
                                </button>
                                <button className={styles.deleteButton} onClick={() => handleDelete(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
