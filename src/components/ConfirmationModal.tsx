"use client";

import { AlertTriangle, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = "Bekreft",
    cancelText = "Avbryt",
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 99999
            }}
            onClick={onCancel}
        >
            <div
                className="glass"
                style={{
                    padding: "2rem",
                    borderRadius: "16px",
                    maxWidth: "400px",
                    width: "90%",
                    border: "1px solid var(--glass-border)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                    animation: "fadeIn 0.2s ease-out"
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {isDestructive && <AlertTriangle size={24} color="#e74c3c" />}
                        <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{title}</h3>
                    </div>

                    <p style={{ color: "var(--text-muted)", lineHeight: "1.5" }}>{message}</p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button
                            onClick={onCancel}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                border: "1px solid var(--glass-border)",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "var(--text-main)",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: 500
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                border: "none",
                                background: isDestructive ? "#e74c3c" : "var(--accent-gold)",
                                color: isDestructive ? "white" : "black",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: 600
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
