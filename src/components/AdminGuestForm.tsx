import { useState, useEffect } from "react";
import { addGuest, updateGuest } from "@/app/actions";
import styles from "./AdminGuestForm.module.css";
import { PlusCircle, Loader2, Utensils, Martini, CheckCircle2, XCircle, HelpCircle, WheatOff, EggOff, MilkOff, Vegan, Save, X } from "lucide-react";

interface AdminGuestFormProps {
    initialData?: any;
    tables?: any[];
    guests?: any[];
    onCancel?: () => void;
    onSuccess?: () => void;
    eventType?: string;
}

export default function AdminGuestForm({ eventId, initialData, tables = [], guests = [], onCancel, onSuccess, eventType = 'WEDDING' }: AdminGuestFormProps & { eventId: string }) {
    const [name, setName] = useState("");
    const [isDinner, setIsDinner] = useState(false);
    const [isParty, setIsParty] = useState(false);
    const [allergies, setAllergies] = useState("");
    const [rsvpStatus, setRsvpStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED">("PENDING");
    const [tableId, setTableId] = useState<string>("");
    const [partnerId, setPartnerId] = useState<string>("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setIsDinner(initialData.type === 'DINNER');
            setIsParty(true);
            if (initialData.type === 'DINNER') {
                setIsDinner(true);
                setIsParty(true);
            } else {
                setIsDinner(false);
                setIsParty(true);
            }
            setAllergies(initialData.allergies || "");
            setRsvpStatus(initialData.rsvpStatus);
            setTableId(initialData.tableId || "");
            setPartnerId(initialData.partnerId || "");
            setMobile(initialData.mobile || "");
            setAddress(initialData.address || "");
            setRole(initialData.role || "");
        } else {
            setName("");
            setIsDinner(true);
            setIsParty(true);
            setAllergies("");
            setRsvpStatus("PENDING");
            setTableId("");
            setPartnerId("");
            setMobile("");
            setAddress("");
            setRole("");
        }
    }, [initialData]);

    const handleAddAllergy = (allergy: string) => {
        if (allergies.includes(allergy)) {
            setAllergies(allergies.replace(new RegExp(`(?:^|, )${allergy}`), "").trim().replace(/^, /, ""));
        } else {
            setAllergies(allergies ? `${allergies}, ${allergy}` : allergy);
        }
    };

    const hasAllergy = (allergy: string) => allergies.includes(allergy);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Logic: Checks -> Type
        // Dinner + Party -> DINNER
        // Dinner only -> DINNER (Schema constraint)
        // Party only -> PARTY
        // Neither -> Default to Party or Error? Let's default to PARTY if neither is checked (or prevent submit).

        let finalType: "DINNER" | "PARTY" = "PARTY";
        if (isDinner) {
            finalType = "DINNER";
        }

        // If neither is selected, maybe alert user?
        if (!isDinner && !isParty) {
            setMessage("Du må velge minst en type (Middag eller Fest).");
            setLoading(false);
            return;
        }

        const finalTableId = tableId === "" ? null : tableId;
        const finalPartnerId = partnerId === "" ? null : partnerId;

        let result;
        if (initialData) {
            result = await updateGuest(initialData.id, { name, type: finalType, allergies, rsvpStatus, tableId: finalTableId, partnerId: finalPartnerId, mobile, address, role });
        } else {
            result = await addGuest(eventId, name, finalType, allergies, rsvpStatus, finalTableId, finalPartnerId, mobile, address, role);
        }

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage(initialData ? "Gjest oppdatert!" : "Gjest lagt til!");
            if (!initialData) {
                setName("");
                setIsDinner(true);
                setIsParty(true);
                setAllergies("");
                setRsvpStatus("PENDING");
                setTableId("");
                setPartnerId("");
                setMobile("");
                setAddress("");
                setRole("");
            }
            if (onSuccess) onSuccess();
        }
        setLoading(false);
    };

    // Filter guests for partner selection (exclude self)
    const availablePartners = guests.filter(g => g.id !== initialData?.id);

    return (
        <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{initialData ? "Rediger gjest" : "Legg til ny gjest"}</h3>
                {initialData && (
                    <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className={styles.inputGroup}>
                <label>Navn</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Fullt navn"
                    className={styles.input}
                />
            </div>

            <div className={styles.inputGroup} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label>Mobil</label>
                    <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Mobilnummer"
                        className={styles.input}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Rolle</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={styles.input}
                            style={{ cursor: 'pointer', appearance: 'none' }}
                        >
                            <option value="">Ingen spesiell rolle</option>
                            {eventType === 'WEDDING' && (
                                <>
                                    <option value="Brud">👰 Brud</option>
                                    <option value="Brudgom">🤵 Brudgom</option>
                                    <option value="Toastmaster">🎤 Toastmaster</option>
                                    <option value="Forlover (Brud)">♀ Forlover (Brud)</option>
                                    <option value="Forlover (Brudgom)">♂ Forlover (Brudgom)</option>
                                    <option value="Takk for maten">🍽️ Takk for maten</option>
                                </>
                            )}
                            {eventType === 'CHRISTENING' && (
                                <>
                                    <option value="Fadder">🙏 Fadder</option>
                                    <option value="Toastmaster">🎤 Toastmaster</option>
                                    <option value="Takk for maten">🍽️ Takk for maten</option>
                                </>
                            )}
                            {eventType !== 'WEDDING' && eventType !== 'CHRISTENING' && (
                                <>
                                    <option value="Toastmaster">🎤 Toastmaster</option>
                                    <option value="Takk for maten">🍽️ Takk for maten</option>
                                </>
                            )}
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label>Adresse</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Gateadresse, Postnummer Sted"
                    className={styles.input}
                />
            </div>

            <div className={styles.inputGroup}>
                <label>Partner / +1</label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={partnerId}
                        onChange={(e) => setPartnerId(e.target.value)}
                        className={styles.input}
                        style={{ cursor: 'pointer', appearance: 'none' }}
                    >
                        <option value="">Ingen partner</option>
                        {availablePartners.map((guest) => (
                            <option key={guest.id} value={guest.id}>
                                {guest.name}
                            </option>
                        ))}
                    </select>
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Gjestetype</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsDinner(!isDinner)}
                        className={`${styles.typeButton} ${isDinner ? styles.activeType : ""}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: isDinner ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                            background: isDinner ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            opacity: isDinner ? 1 : 0.7
                        }}
                    >
                        <Utensils size={24} color={isDinner ? 'var(--accent-gold)' : 'currentColor'} />
                        <span style={{ fontWeight: 500 }}>Middag</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsParty(!isParty)}
                        className={`${styles.typeButton} ${isParty ? styles.activeType : ""}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: isParty ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                            background: isParty ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            opacity: isParty ? 1 : 0.7
                        }}
                    >
                        <Martini size={24} color={isParty ? 'var(--accent-gold)' : 'currentColor'} />
                        <span style={{ fontWeight: 500 }}>Fest</span>
                    </button>
                </div>
            </div>

            {isDinner && tables && tables.length > 0 && (
                <div className={styles.inputGroup}>
                    <label>Bordplassering</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setTableId("")}
                            className={`${styles.tagButton} ${tableId === "" ? styles.active : ""}`}
                            style={{ padding: '0.6rem 1rem' }}
                        >
                            Ingen
                        </button>
                        {tables.map((table) => {
                            // Correctly calculating if full
                            // Need to handle if creating vs editing.
                            // If editing and guest is already in this table, they don't count towards limit for themselves?
                            // No, table.guests includes current guest if saved.
                            // We should check if length >= capacity.
                            // But if we are the guest in that table, we shouldn't be blocked.
                            const isAssignedToThis = initialData && initialData.tableId === table.id;
                            const guestsCount = table.guests ? table.guests.length : 0;
                            const capacity = table.capacity || 8;
                            const isFull = guestsCount >= capacity && !isAssignedToThis;

                            return (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => !isFull && setTableId(table.id)}
                                    className={`${styles.tagButton} ${tableId === table.id ? styles.active : ""}`}
                                    disabled={isFull}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        opacity: isFull ? 0.5 : 1,
                                        cursor: isFull ? 'not-allowed' : 'pointer',
                                        background: isFull ? 'rgba(0,0,0,0.2)' : undefined,
                                        color: isFull ? '#888' : undefined,
                                        border: isFull ? '1px solid transparent' : undefined
                                    }}
                                    title={isFull ? `Fullt (${guestsCount}/${capacity})` : `${guestsCount}/${capacity} plasser`}
                                >
                                    {table.name} <span style={{ fontSize: '0.7em', opacity: 0.7, marginLeft: '4px' }}>({guestsCount}/{capacity})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={styles.inputGroup}>
                <label>Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setRsvpStatus("ACCEPTED")}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem',
                            border: rsvpStatus === 'ACCEPTED' ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                            background: rsvpStatus === 'ACCEPTED' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            opacity: rsvpStatus === 'ACCEPTED' ? 1 : 0.7
                        }}
                    >
                        <CheckCircle2 size={24} color={rsvpStatus === 'ACCEPTED' ? 'var(--accent-green)' : 'currentColor'} />
                        <span style={{ fontSize: '0.9rem' }}>Kommer</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRsvpStatus("DECLINED")}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem',
                            border: rsvpStatus === 'DECLINED' ? '1px solid #e74c3c' : '1px solid var(--glass-border)',
                            background: rsvpStatus === 'DECLINED' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            opacity: rsvpStatus === 'DECLINED' ? 1 : 0.7
                        }}
                    >
                        <XCircle size={24} color={rsvpStatus === 'DECLINED' ? '#e74c3c' : 'currentColor'} />
                        <span style={{ fontSize: '0.9rem' }}>Kan ikke</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRsvpStatus("PENDING")}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem',
                            border: rsvpStatus === 'PENDING' ? '1px solid var(--text-muted)' : '1px solid var(--glass-border)',
                            background: rsvpStatus === 'PENDING' ? 'rgba(0,0,0,0.05)' : 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            opacity: rsvpStatus === 'PENDING' ? 1 : 0.7
                        }}
                    >
                        <HelpCircle size={24} color={rsvpStatus === 'PENDING' ? 'var(--text-muted)' : 'currentColor'} />
                        <span style={{ fontSize: '0.9rem' }}>Uavklart</span>
                    </button>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Allergier / Diett</label>
                <div className={styles.quickTags}>
                    <button type="button" onClick={() => handleAddAllergy("Gluten")} className={`${styles.tagButton} ${hasAllergy("Gluten") ? styles.active : ""}`}>
                        <WheatOff size={16} /> Gluten
                    </button>
                    <button type="button" onClick={() => handleAddAllergy("Laktose")} className={`${styles.tagButton} ${hasAllergy("Laktose") ? styles.active : ""}`}>
                        <MilkOff size={16} /> Laktose
                    </button>
                    <button type="button" onClick={() => handleAddAllergy("Vegetar")} className={`${styles.tagButton} ${hasAllergy("Vegetar") ? styles.active : ""}`}>
                        <Vegan size={16} /> Vegetar
                    </button>
                    <button type="button" onClick={() => handleAddAllergy("Egg")} className={`${styles.tagButton} ${hasAllergy("Egg") ? styles.active : ""}`}>
                        <EggOff size={16} /> Egg
                    </button>
                </div>
                <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Eks: Gluten, Nøtter..."
                    className={styles.input}
                    style={{ marginTop: '0.5rem' }}
                />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? <Loader2 className="spin" size={20} /> : initialData ? <Save size={20} /> : <PlusCircle size={20} />}
                {initialData ? "Lagre endringer" : "Legg til gjest"}
            </button>

            {message && <p className={styles.message}>{message}</p>}
        </form>
    );
}
