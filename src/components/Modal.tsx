"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({
    isOpen,
    title,
    onClose,
    children
}: ModalProps) {
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
            onClick={onClose}
        >
            <div
                className="glass"
                style={{
                    padding: "2rem",
                    borderRadius: "16px",
                    maxWidth: "500px",
                    width: "90%",
                    border: "1px solid var(--glass-border)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                    animation: "fadeIn 0.2s ease-out",
                    position: "relative"
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", background: "var(--gradient-main)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
