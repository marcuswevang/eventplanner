"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        // Check for saved theme
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            // Default to system preference
            setTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: "fixed",
                top: "1rem",
                right: "1rem",
                zIndex: 9999,
                background: "var(--card-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "50%",
                padding: "0.8rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)"
            }}
            title={theme === "light" ? "Bytt til mørk modus" : "Bytt til lys modus"}
        >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
