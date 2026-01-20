"use client";

import { useState } from "react";
import styles from "./AdminSettings.module.css";
import {
    Save, Calendar, Layout, Utensils, PartyPopper,
    ChevronUp, ChevronDown, ChevronRight, Info, AlertCircle, CheckCircle2, Users,
    GripVertical
} from "lucide-react";
import IconPicker, { ICON_LIBRARY } from "./IconPicker";
import LandingPageRenderer from './LandingPageRenderer';
import { updateEventSettings } from "@/app/actions";

interface AdminSettingsProps {
    eventId: string;
    initialEventSettings: any;
    guests?: any[];
}

const DEFAULT_LAYOUT = ["title", "gallery", "date", "welcome", "countdown", "rsvp", "links"];

const DEFAULT_SETTINGS = {
    countdownDate: "2026-08-15T15:00:00",
    landingPage: {
        titleNames: "Marita & Marcus",
        dateText: "15. AUGUST 2026",
        welcomeText: "Velkomstmelding",
        showGallery: true,
        showRsvp: true,
        showDinner: true,
        showParty: true,
        showWishlist: true,
        showPlaylist: true,
        layout: DEFAULT_LAYOUT,
        verticalOffset: 15
    },
    dinnerPage: {
        title: "Marita & Marcus",
        intro: "Velkommen til middag. Vi gleder oss stort til å dele denne dagen med dere.",
        cards: [
            { id: "ceremony", title: "Vielse", icon: "Church", text: "Tiller Kirke kl. 12:00", details: "Vennligst møt opp i god tid." },
            { id: "dinner", title: "Middag", icon: "Utensils", text: "Middagen serveres kl. 17:00", details: "Flotten Forsamlingshus" },
            { id: "place", title: "Sted", icon: "MapPin", text: "Tillerbruvegen 147", details: "7092 Tiller" },
            { id: "menu", title: "Meny", icon: "BookOpen", text: "Sesongbasert 3-retters", details: "Gi beskjed om allergier." },
            { id: "practical", title: "Praktisk info", icon: "Info", text: "Forlovere & Toastmaster", details: "Trykk for mer info" }
        ]
    },
    partyPage: {
        title: "Marita & Marcus",
        intro: "Velkommen til fest! Vi gleder oss til å danse natten lang med dere.",
        cards: [
            { id: "ceremony", title: "Vielse", icon: "Church", text: "Tiller Kirke kl. 12:00", details: "15. august 2026" },
            { id: "party", title: "Fest", icon: "Music", text: "Festen starter kl. 21:00", details: "Flotten Forsamlingshus" },
            { id: "place", title: "Sted", icon: "MapPin", text: "Tillerbruvegen 147", details: "7092 Tiller" },
            { id: "serving", title: "Servering", icon: "GlassWater", text: "Åpen bar og snacks", details: "Nattmat serveres ved midnatt." },
            { id: "practical", title: "Praktisk info", icon: "Info", text: "Forlovere & Toastmaster", details: "Trykk for mer info" }
        ]
    },
    common: {
        instagramHashtag: "#mpw2026",
        bride: "",
        maidOfHonor: "",
        groom: "",
        bestMan: "",
        toastmaster: "",
        thanksForMeal: ""
    }
};

export default function AdminSettings({ eventId, initialEventSettings, guests }: AdminSettingsProps) {
    const [eventSettings, setEventSettings] = useState<any>(() => {
        // Deep merge defaults with initial settings
        const settings = { ...DEFAULT_SETTINGS };
        if (initialEventSettings) {
            if (initialEventSettings.countdownDate) settings.countdownDate = initialEventSettings.countdownDate;
            if (initialEventSettings.landingPage) settings.landingPage = { ...settings.landingPage, ...initialEventSettings.landingPage };
            if (initialEventSettings.dinnerPage) settings.dinnerPage = { ...settings.dinnerPage, ...initialEventSettings.dinnerPage };
            if (initialEventSettings.partyPage) settings.partyPage = { ...settings.partyPage, ...initialEventSettings.partyPage };
            if (initialEventSettings.common) settings.common = { ...settings.common, ...initialEventSettings.common };

            // Migration: Split legacy components
            if (settings.landingPage.layout.includes("text") || settings.landingPage.layout.includes("actions")) {
                const newLayout = [];
                for (const item of settings.landingPage.layout) {
                    if (item === "text") {
                        newLayout.push("date", "welcome");
                    } else if (item === "actions") {
                        newLayout.push("rsvp", "links");
                    } else {
                        newLayout.push(item);
                    }
                }
                settings.landingPage.layout = newLayout;
            }
        }
        return settings;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [activeIconPicker, setActiveIconPicker] = useState<{ section: string, index: number } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await updateEventSettings(eventId, { eventSettings });
            if (result.success) {
                setMessage({ text: "Innstillingene ble lagret!", type: 'success' });
            } else {
                setMessage({ text: result.error || "Noe gikk galt.", type: 'error' });
            }
        } catch (error) {
            setMessage({ text: "Kunne ikke lagre innstillinger.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateLandingPage = (field: string, value: any) => {
        setEventSettings((prev: any) => ({
            ...prev,
            landingPage: { ...prev.landingPage, [field]: value }
        }));
    };

    const updatePageHeader = (section: 'dinnerPage' | 'partyPage', field: string, value: string) => {
        setEventSettings((prev: any) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const updateCard = (section: 'dinnerPage' | 'partyPage', index: number, field: string, value: string) => {
        setEventSettings((prevSettings: any) => {
            const updatedSection = { ...prevSettings[section] };
            const updatedCards = [...updatedSection.cards];
            updatedCards[index] = { ...updatedCards[index], [field]: value };
            return {
                ...prevSettings,
                [section]: { ...updatedSection, cards: updatedCards }
            };
        });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("index", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData("index"));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

        setEventSettings((prev: any) => {
            const currentLayout = prev.landingPage?.layout || DEFAULT_LAYOUT;
            const newLayout = [...currentLayout];
            const [movedItem] = newLayout.splice(sourceIndex, 1);
            newLayout.splice(targetIndex, 0, movedItem);

            return {
                ...prev,
                landingPage: { ...prev.landingPage, layout: newLayout }
            };
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const COMPONENT_LABELS: Record<string, string> = {
        "title": "Tittel (Navn)",
        "date": "Dato",
        "welcome": "Velkomstmelding",
        "countdown": "Nedtelling",
        "rsvp": "Knapp: Svar på invitasjon",
        "links": "Lenker: Middag, Fest, Ønskeliste etc.",
        "gallery": "Bildegalleri",
        "text": "Tekst (Legacy)",
        "actions": "Knapper (Legacy)",
        "hero": "Legacy Header"
    };

    return (
        <div className={styles.container}>
            {/* Common Settings */}
            <section className={styles.section}>
                <h2><Info /> Generelle Innstillinger</h2>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button
                        className={styles.iconButton}
                        style={{ width: 'auto', padding: '0 1rem', borderRadius: '8px' }}
                        title="Hent roller fra gjestelisten"
                        onClick={() => {
                            if (!guests) return;
                            const bride = guests.find(g => g.role?.toLowerCase() === 'brud')?.name || "";
                            const groom = guests.find(g => g.role?.toLowerCase() === 'brudgom')?.name || "";
                            const toastmaster = guests.find(g => g.role?.toLowerCase() === 'toastmaster')?.name || "";
                            const maidOfHonor = guests.find(g => (g.role?.toLowerCase() === 'forlover' || g.role?.toLowerCase() === 'maid of honor') && g.gender === 'FEMALE')?.name || "";
                            const bestMan = guests.find(g => (g.role?.toLowerCase() === 'forlover' || g.role?.toLowerCase() === 'bestman' || g.role?.toLowerCase() === 'best man') && g.gender === 'MALE')?.name || "";
                            const thanksForMeal = guests.find(g => g.role?.toLowerCase() === 'takk for maten' || g.role?.toLowerCase() === 'thanks for meal')?.name || "";

                            setEventSettings((prev: any) => ({
                                ...prev,
                                common: {
                                    ...prev.common,
                                    bride: bride || prev.common?.bride,
                                    groom: groom || prev.common?.groom,
                                    toastmaster: toastmaster || prev.common?.toastmaster,
                                    maidOfHonor: maidOfHonor || prev.common?.maidOfHonor,
                                    bestMan: bestMan || prev.common?.bestMan,
                                    thanksForMeal: thanksForMeal || prev.common?.thanksForMeal
                                }
                            }));
                        }}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem' }} />
                        Hent roller fra gjesteliste
                    </button>
                </div>
                <div className={styles.grid}>
                    {/* Brud & Forlover */}
                    <div className={styles.inputGroup}>
                        <label>Brud</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.bride || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, bride: e.target.value }
                            }))}
                            placeholder="Navn på brud"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Forlover (Brud)</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.maidOfHonor || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, maidOfHonor: e.target.value }
                            }))}
                            placeholder="Navn på forlover for brud"
                        />
                    </div>

                    {/* Brudgom & Forlover */}
                    <div className={styles.inputGroup}>
                        <label>Brudgom</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.groom || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, groom: e.target.value }
                            }))}
                            placeholder="Navn på brudgom"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Forlover (Brudgom)</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.bestMan || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, bestMan: e.target.value }
                            }))}
                            placeholder="Navn på forlover for brudgom"
                        />
                    </div>

                    {/* Toastmaster & Takk for maten */}
                    <div className={styles.inputGroup}>
                        <label>Toastmaster</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.toastmaster || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, toastmaster: e.target.value }
                            }))}
                            placeholder="Navn på toastmaster"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Takk for maten tale</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.thanksForMeal || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, thanksForMeal: e.target.value }
                            }))}
                            placeholder="Navn på den som takker for maten"
                        />
                    </div>

                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                        <label>Instagram Hashtag</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={eventSettings.common?.instagramHashtag || ""}
                            onChange={(e) => setEventSettings((prev: any) => ({
                                ...prev,
                                common: { ...prev.common, instagramHashtag: e.target.value }
                            }))}
                            placeholder="#bryllup2026"
                        />
                    </div>
                </div>
            </section>

            {/* Landing Page Settings */}
            <section className={styles.section}>
                <h2><Calendar /> Forsiden & Nedtelling</h2>
                <div className={styles.grid}>

                    {/* Left Column: Controls */}
                    <div className={styles.grid}>
                        <div className={styles.inputGrid}>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showRsvp ?? true}
                                        onChange={(e) => updateLandingPage('showRsvp', e.target.checked)}
                                    />
                                    Vis RSVP-knapp
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showDinner ?? true}
                                        onChange={(e) => updateLandingPage('showDinner', e.target.checked)}
                                    />
                                    Vis Middag-lenke
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showParty ?? true}
                                        onChange={(e) => updateLandingPage('showParty', e.target.checked)}
                                    />
                                    Vis Fest-lenke
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showWishlist ?? true}
                                        onChange={(e) => updateLandingPage('showWishlist', e.target.checked)}
                                    />
                                    Vis Ønskeliste-lenke
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showPlaylist ?? true}
                                        onChange={(e) => updateLandingPage('showPlaylist', e.target.checked)}
                                    />
                                    Vis Sangønsker-lenke
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={eventSettings.landingPage?.showGallery ?? true}
                                        onChange={(e) => updateLandingPage('showGallery', e.target.checked)}
                                    />
                                    Vis Bildegalleri
                                </label>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nedtelling (Dato og Tid)</label>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={eventSettings.countdownDate.substring(0, 16)}
                                onChange={(e) => setEventSettings((prev: any) => ({ ...prev, countdownDate: e.target.value }))}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Navn (Overskrift)</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={eventSettings.landingPage.titleNames}
                                onChange={(e) => updateLandingPage('titleNames', e.target.value)}
                                placeholder="Navn (f.eks. Marita & Marcus)"
                            />
                        </div>


                        <div className={styles.inputGroup}>
                            <label>Dato (Tekst)</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={eventSettings.landingPage.dateText}
                                onChange={(e) => updateLandingPage('dateText', e.target.value)}
                                placeholder="Dato (f.eks. 15. AUGUST 2026)"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Velkomsttekst</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={eventSettings.landingPage.welcomeText}
                                onChange={(e) => updateLandingPage('welcomeText', e.target.value)}
                                placeholder="Velkomstmelding"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Positioning & Preview */}
            <section className={styles.section}>
                <h2><Layout /> Visuell Plassering & Forhåndsvisning</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                            <label>Vertikal plassering av innhold ({eventSettings.landingPage?.verticalOffset ?? 15}vh fra toppen)</label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={eventSettings.landingPage?.verticalOffset ?? 15}
                                onChange={(e) => updateLandingPage('verticalOffset', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                            />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Juster hvor langt ned på siden innholdet skal starte. Dette påvirker alle elementer (tittel, nedtelling, galleri etc.).
                        </p>

                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <label>Rekkefølge på elementer</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {(eventSettings.landingPage?.layout || DEFAULT_LAYOUT).map((component: string, index: number) => (
                                    <div
                                        key={component}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'grab',
                                            transition: 'transform 0.2s, background-color 0.2s',
                                            gap: '1rem'
                                        }}
                                        className={styles.draggableItem}
                                    >
                                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                            <GripVertical size={20} />
                                        </div>
                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                            {COMPONENT_LABELS[component] || component}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '2rem',
                        background: 'var(--bg-main)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--bg-secondary)',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-muted)'
                        }}>
                            Forhåndsvisning
                        </div>
                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', padding: '1rem' }}>
                            <LandingPageRenderer settings={eventSettings} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Dinner Page Settings */}
            <section className={styles.section}>
                <h2><Utensils /> Middag-side</h2>
                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                    <label>Sidetittel</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={eventSettings.dinnerPage.title}
                        onChange={(e) => updatePageHeader('dinnerPage', 'title', e.target.value)}
                        placeholder="Sidetittel"
                    />
                </div>
                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                    <label>Innledningstekst</label>
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '80px', resize: 'vertical' }}
                        value={eventSettings.dinnerPage.intro}
                        onChange={(e) => updatePageHeader('dinnerPage', 'intro', e.target.value)}
                        placeholder="Intro tekst"
                    />
                </div>
                <div className={styles.grid}>
                    {eventSettings.dinnerPage.cards.map((card: any, index: number) => (
                        <div key={card.id} className={`${styles.card} glass`}>
                            <div className={styles.cardHeader}>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => setActiveIconPicker({ section: 'dinnerPage', index })}
                                    >
                                        {(() => {
                                            const IconComp = ICON_LIBRARY[card.icon] || Info;
                                            return <IconComp size={20} />;
                                        })()}
                                    </button>
                                    {activeIconPicker?.section === 'dinnerPage' && activeIconPicker.index === index && (
                                        <IconPicker
                                            value={card.icon}
                                            onChange={(iconName) => {
                                                setEventSettings((prev: any) => {
                                                    const section = prev[activeIconPicker.section];
                                                    const updatedCards = [...section.cards];
                                                    updatedCards[activeIconPicker.index] = {
                                                        ...updatedCards[activeIconPicker.index],
                                                        icon: iconName
                                                    };
                                                    return {
                                                        ...prev,
                                                        [activeIconPicker.section]: {
                                                            ...section,
                                                            cards: updatedCards
                                                        }
                                                    };
                                                });
                                            }}
                                            onClose={() => setActiveIconPicker(null)}
                                        />
                                    )}
                                </div>
                                <span>Kort {index + 1}</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Tittel</label>
                                <input
                                    className={styles.input}
                                    value={card.title}
                                    onChange={(e) => updateCard('dinnerPage', index, 'title', e.target.value)}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Hovedtekst</label>
                                <input
                                    className={styles.input}
                                    value={card.text}
                                    onChange={(e) => updateCard('dinnerPage', index, 'text', e.target.value)}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Detaljer</label>
                                <input
                                    className={styles.input}
                                    value={card.details}
                                    onChange={(e) => updateCard('dinnerPage', index, 'details', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Party Page Settings */}
            <section className={styles.section}>
                <h2><PartyPopper /> Fest-side</h2>
                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                    <label>Sidetittel</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={eventSettings.partyPage.title}
                        onChange={(e) => updatePageHeader('partyPage', 'title', e.target.value)}
                        placeholder="Sidetittel"
                    />
                </div>
                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                    <label>Innledningstekst</label>
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '80px', resize: 'vertical' }}
                        value={eventSettings.partyPage.intro}
                        onChange={(e) => updatePageHeader('partyPage', 'intro', e.target.value)}
                        placeholder="Intro tekst"
                    />
                </div>
                <div className={styles.grid}>
                    {eventSettings.partyPage.cards.map((card: any, index: number) => (
                        <div key={card.id} className={`${styles.card} glass`}>
                            <div className={styles.cardHeader}>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => setActiveIconPicker({ section: 'partyPage', index })}
                                    >
                                        {(() => {
                                            const IconComp = ICON_LIBRARY[card.icon] || Info;
                                            return <IconComp size={20} />;
                                        })()}
                                    </button>
                                    {activeIconPicker?.section === 'partyPage' && activeIconPicker.index === index && (
                                        <IconPicker
                                            value={card.icon}
                                            onChange={(iconName) => {
                                                setEventSettings((prev: any) => {
                                                    const section = prev[activeIconPicker.section];
                                                    const updatedCards = [...section.cards];
                                                    updatedCards[activeIconPicker.index] = {
                                                        ...updatedCards[activeIconPicker.index],
                                                        icon: iconName
                                                    };
                                                    return {
                                                        ...prev,
                                                        [activeIconPicker.section]: {
                                                            ...section,
                                                            cards: updatedCards
                                                        }
                                                    };
                                                });
                                            }}
                                            onClose={() => setActiveIconPicker(null)}
                                        />
                                    )}
                                </div>
                                <span>Kort {index + 1}</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Tittel</label>
                                <input
                                    className={styles.input}
                                    value={card.title}
                                    onChange={(e) => updateCard('partyPage', index, 'title', e.target.value)}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Hovedtekst</label>
                                <input
                                    className={styles.input}
                                    value={card.text}
                                    onChange={(e) => updateCard('partyPage', index, 'text', e.target.value)}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Detaljer</label>
                                <input
                                    className={styles.input}
                                    value={card.details}
                                    onChange={(e) => updateCard('partyPage', index, 'details', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sticky Save Bar */}
            <div className={styles.saveBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {message && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: message.type === 'success' ? 'var(--accent-green)' : '#ff4444',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={20} />
                    {isSaving ? "Lagrer..." : "Lagre endringer"}
                </button>
            </div>
        </div>
    );
}
