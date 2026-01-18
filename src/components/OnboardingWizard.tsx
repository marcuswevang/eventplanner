"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./OnboardingWizard.module.css";
import { Sparkles, Calendar, Type, Globe, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { createEvent } from "@/app/actions";

const STEPS = [
    { id: "type", title: "Hva skal vi feire?", icon: Sparkles },
    { id: "details", title: "Navn og dato", icon: Calendar },
    { id: "slug", title: "Din unike adresse", icon: Globe },
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
