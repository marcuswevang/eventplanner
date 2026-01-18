"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./OnboardingWizard.module.css";
import { Sparkles, Calendar, Type, Globe, ArrowRight, Loader2, CheckCircle2, LayoutDashboard, Check, X, Users, Plus, Trash2 } from "lucide-react";
import { createEvent } from "@/app/actions";

const STEPS = [
    { id: "type", title: "Hva skal vi feire?", icon: Sparkles },
    { id: "details", title: "Navn og dato", icon: Calendar },
    { id: "roles", title: "Nøkkelpersoner", icon: Users },
    { id: "modules", title: "Hva trenger dere?", icon: LayoutDashboard },
    { id: "slug", title: "Din unike adresse", icon: Globe },
];

const MODULES = [
    { id: "budget", label: "Budsjett", description: "Hold oversikt over utgifter" },
    { id: "wishlist", label: "Ønskeliste", description: "Del ønsker med gjestene" },
    { id: "guests", label: "Gjesteliste", description: "Oversikt over inviterte og RSVP" },
    { id: "seating", label: "Bordplassering", description: "Lag bordkart" },
    { id: "gallery", label: "Bildegalleri", description: "Last opp og del bilder" },
];

const EVENT_TYPES = [
    { id: "WEDDING", label: "Bryllup", description: "Planlegg deres store dag" },
    { id: "CHRISTENING", label: "Dåp", description: "En høytidelig markering" },
    { id: "CONFIRMATION", label: "Konfirmasjon", description: "Feiring av overgangen" },
    { id: "JUBILEE", label: "Jubileum", description: "Runde tall og merkedager" },
    { id: "OTHER", label: "Annet", description: "En hvilken som helst fest" },
];

export default function OnboardingWizard() {
    const [stepIndex, setStepIndex] = useState(0);
    const [formData, setFormData] = useState({
        type: "WEDDING" as any,
        name: "",
        date: "",
        slug: "",
        config: {
            budgetEnabled: true,
            wishlistEnabled: true,
            guestsEnabled: true,
            seatingEnabled: true,
            galleryEnabled: true,
        },
        roles: {
            bridesmaids: [""] as string[],
            groomsmen: [""] as string[],
            toastmaster: "" as string,
            godparents: [""] as string[]
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const currentStep = STEPS[stepIndex];

    const handleNext = async () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const result = await createEvent({
                ...formData,
                date: new Date(formData.date),
                initialGuests: [
                    ...formData.roles.bridesmaids.filter(n => n.trim()).map(n => ({ name: n, role: 'Forlover (Brud)' })),
                    ...formData.roles.groomsmen.filter(n => n.trim()).map(n => ({ name: n, role: 'Forlover (Brudgom)' })),
                    ...(formData.roles.toastmaster ? [{ name: formData.roles.toastmaster, role: 'Toastmaster' }] : []),
                    ...formData.roles.godparents.filter(n => n.trim()).map(n => ({ name: n, role: 'Fadder' }))
                ]
            });

            if (result.error) {
                setError(result.error);
            } else if (result.event) {
                router.push(`/admin?eventId=${result.event.id}`);
                router.refresh();
            }
        } catch (err) {
            setError("Noe gikk galt under opprettelsen.");
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    };

    return (
        <div className={styles.container}>
            <div className={styles.progress}>
                {STEPS.map((step, idx) => (
                    <div
                        key={step.id}
                        className={`${styles.stepIndicator} ${idx <= stepIndex ? styles.active : ""}`}
                        title={step.title}
                    >
                        <div className={styles.indicatorCircle}>
                            {idx < stepIndex ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                        </div>
                        <span className={styles.indicatorLabel}>{step.title}</span>
                    </div>
                ))}
            </div>

            <div className={`${styles.card} glass`}>
                <div className={styles.header}>
                    <currentStep.icon size={32} className={styles.mainIcon} />
                    <h2>{currentStep.title}</h2>
                </div>

                <div className={styles.content}>
                    {currentStep.id === "type" && (
                        <div className={styles.typeGrid}>
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    className={`${styles.typeButton} ${formData.type === type.id ? styles.activeType : ""}`}
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                >
                                    <span className={styles.typeLabel}>{type.label}</span>
                                    <span className={styles.typeDesc}>{type.description}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentStep.id === "details" && (
                        <div className={styles.formGroup}>
                            <div className={styles.field}>
                                <label>Navn på arrangementet</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setFormData({ ...formData, name, slug: generateSlug(name) });
                                    }}
                                    placeholder="f.eks. Marita & Marcus sitt bryllup"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Dato</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep.id === "roles" && formData.type === "WEDDING" && (
                        <div className={styles.formGroup}>
                            <div className={styles.field}>
                                <label>Brudens forlover(e)</label>
                                {formData.roles.bridesmaids.map((name, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                const newArr = [...formData.roles.bridesmaids];
                                                newArr[idx] = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    roles: { ...formData.roles, bridesmaids: newArr }
                                                });
                                            }}
                                            placeholder="Navn"
                                        />
                                        {formData.roles.bridesmaids.length > 1 && (
                                            <button onClick={() => {
                                                const newArr = formData.roles.bridesmaids.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, roles: { ...formData.roles, bridesmaids: newArr } });
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData({
                                        ...formData,
                                        roles: { ...formData.roles, bridesmaids: [...formData.roles.bridesmaids, ""] }
                                    })}
                                    className="luxury-button-ghost"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', width: 'fit-content' }}
                                >
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Legg til forlover
                                </button>
                            </div>

                            <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                                <label>Brudgommens forlover(e)</label>
                                {formData.roles.groomsmen.map((name, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                const newArr = [...formData.roles.groomsmen];
                                                newArr[idx] = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    roles: { ...formData.roles, groomsmen: newArr }
                                                });
                                            }}
                                            placeholder="Navn"
                                        />
                                        {formData.roles.groomsmen.length > 1 && (
                                            <button onClick={() => {
                                                const newArr = formData.roles.groomsmen.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, roles: { ...formData.roles, groomsmen: newArr } });
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData({
                                        ...formData,
                                        roles: { ...formData.roles, groomsmen: [...formData.roles.groomsmen, ""] }
                                    })}
                                    className="luxury-button-ghost"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', width: 'fit-content' }}
                                >
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Legg til forlover
                                </button>
                            </div>

                            <div className={styles.field} style={{ marginTop: '1.5rem' }}>
                                <label>Toastmaster</label>
                                <input
                                    type="text"
                                    value={formData.roles.toastmaster}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        roles: { ...formData.roles, toastmaster: e.target.value }
                                    })}
                                    placeholder="Navn"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep.id === "roles" && formData.type === "CHRISTENING" && (
                        <div className={styles.formGroup}>
                            <div className={styles.field}>
                                <label>Faddere</label>
                                {formData.roles.godparents.map((name, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                const newArr = [...formData.roles.godparents];
                                                newArr[idx] = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    roles: { ...formData.roles, godparents: newArr }
                                                });
                                            }}
                                            placeholder="Navn"
                                        />
                                        {formData.roles.godparents.length > 1 && (
                                            <button onClick={() => {
                                                const newArr = formData.roles.godparents.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, roles: { ...formData.roles, godparents: newArr } });
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFormData({
                                        ...formData,
                                        roles: { ...formData.roles, godparents: [...formData.roles.godparents, ""] }
                                    })}
                                    className="luxury-button-ghost"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', width: 'fit-content' }}
                                >
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Legg til fadder
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep.id === "roles" && formData.type !== "WEDDING" && formData.type !== "CHRISTENING" && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            <p>Ingen spesielle roller definert for denne typen arrangement ennå.</p>
                            <p>Trykk neste for å fortsette.</p>
                        </div>
                    )}

                    {currentStep.id === "modules" && (
                        <div className={styles.typeGrid}>
                            {MODULES.map((module) => {
                                const key = `${module.id}Enabled` as keyof typeof formData.config;
                                const isEnabled = formData.config[key];
                                return (
                                    <button
                                        key={module.id}
                                        className={`${styles.typeButton} ${isEnabled ? styles.activeType : ""}`}
                                        onClick={() => setFormData({
                                            ...formData,
                                            config: {
                                                ...formData.config,
                                                [key]: !isEnabled
                                            }
                                        })}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', position: 'relative' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '4px' }}>
                                            <span className={styles.typeLabel}>{module.label}</span>
                                            {isEnabled ? <Check size={18} /> : <X size={18} style={{ opacity: 0.5 }} />}
                                        </div>
                                        <span className={styles.typeDesc}>{module.description}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {currentStep.id === "slug" && (
                        <div className={styles.formGroup}>
                            <div className={styles.field}>
                                <label>Nettadresse (URL)</label>
                                <div className={styles.slugInputWrapper}>
                                    <span className={styles.domain}>eventplanner.no/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="marita-marcus-2026"
                                        required
                                    />
                                </div>
                                <p className={styles.hint}>Dette er adressen gjestene dine bruker for å se nettsiden.</p>
                            </div>
                        </div>
                    )}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    {stepIndex > 0 && (
                        <button
                            className={styles.backButton}
                            onClick={() => setStepIndex(stepIndex - 1)}
                            disabled={loading}
                        >
                            Tilbake
                        </button>
                    )}
                    <button
                        className={styles.nextButton}
                        onClick={handleNext}
                        disabled={loading || (currentStep.id === "details" && (!formData.name || !formData.date)) || (currentStep.id === "slug" && !formData.slug)}
                    >
                        {loading ? (
                            <Loader2 className="spin" size={20} />
                        ) : (
                            <>
                                <span>{stepIndex === STEPS.length - 1 ? "Start planleggingen" : "Neste"}</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
