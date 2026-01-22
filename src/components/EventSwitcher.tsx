"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./EventSwitcher.module.css";
import { ChevronDown, Calendar, Plus } from "lucide-react";
import { getUserEvents } from "@/app/actions";

interface Event {
    id: string;
    name: string;
    type: string;
    date: Date | null;
}

export default function EventSwitcher({
    currentEventId,
    userId
}: {
    currentEventId: string;
    userId: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function loadEvents() {
            const result = await getUserEvents(userId);
            if (result.events) {
                setEvents(result.events as any);
            }
        }
        loadEvents();
    }, [userId]);

    const currentEvent = events.find(e => e.id === currentEventId);

    const handleSwitch = (eventId: string) => {
        setIsOpen(false);
        // For now, we manually redirect. In the future, this could update a context or URL param.
        // We'll use searchParams to keep it simple without renaming directories yet.
        router.push(`/admin?eventId=${eventId}`);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.currentInfo}>
                    <span className={styles.eventName}>{currentEvent?.name || "Velg arrangement"}</span>
                    <span className={styles.eventDetails}>
                        {currentEvent?.date ? new Date(currentEvent.date).toLocaleDateString() : ""}
                    </span>
                </div>
                <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.open : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={`${styles.dropdown} glass`}>
                        <div className={styles.list}>
                            {events.map((event) => (
                                <button
                                    key={event.id}
                                    className={`${styles.item} ${event.id === currentEventId ? styles.active : ""}`}
                                    onClick={() => handleSwitch(event.id)}
                                >
                                    <Calendar size={16} />
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{event.name}</span>
                                        <span className={styles.itemDate}>
                                            {event.date ? new Date(event.date).toLocaleDateString() : "Ingen dato"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className={styles.footer}>
                            <button
                                className={styles.addButton}
                                onClick={() => router.push("/admin/new")}
                            >
                                <Plus size={16} />
                                <span>Opprett nytt arrangement</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
