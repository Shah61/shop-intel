"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import FieldRepEntryForm from "../components/field-rep-entry-form";
import BossDashboard from "../components/boss-dashboard";


type ViewMode = "rep" | "boss";

export const StockTrackerScreen = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { data: session } = useSession();

    const [viewMode, setViewMode] = useState<ViewMode>("boss");

    const t = useMemo(() => {
        if (isDark) {
            return {
                toggleBg: "rgba(26, 34, 44, 0.6)",
                toggleBorder: "1px solid rgba(var(--preset-primary-rgb), 0.15)",
                toggleActiveBg:
                    "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                toggleInactiveText: "hsl(var(--muted-foreground))",
                toggleActiveText: "#fff",
                title: "hsl(var(--foreground))",
                subtitle: "hsl(var(--muted-foreground))",
                subtitleAccent: "var(--preset-lighter)",
            };
        }
        return {
            toggleBg: "rgba(250, 247, 255, 0.8)",
            toggleBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
            toggleActiveBg:
                "linear-gradient(135deg, var(--preset-lighter), var(--preset-primary))",
            toggleInactiveText: "hsl(var(--muted-foreground))",
            toggleActiveText: "#fff",
            title: "hsl(var(--foreground))",
            subtitle: "hsl(var(--muted-foreground))",
            subtitleAccent: "var(--preset-primary)",
        };
    }, [isDark]);

    const greetingTitle = (() => {
       
        return "Stock Tracker";
    })();

    const subtitleCopy =
        viewMode === "boss"
            ? "Live stock health across every supermarket"
            : "Log what you see on the shelf — we'll handle the rest";

    return (
        <div className="stock-tracker flex flex-col gap-4 w-full">
            {/* Header + View Toggle */}
            <div className="stock-header flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div className="min-w-0 shrink-0">
                    <h2
                        className="stock-greeting text-2xl font-bold"
                        style={{
                            color: t.title,
                            fontFamily: "'Outfit', sans-serif",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        {greetingTitle}
                    </h2>
                    <p
                        style={{
                            color: t.subtitle,
                            fontSize: 14,
                            margin: "2px 0 0 0",
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {subtitleCopy}{" "}
                        <span style={{ color: t.subtitleAccent, fontWeight: 500 }}>
                            • {viewMode === "boss" ? "Manager view" : "Field rep view"}
                        </span>
                    </p>
                </div>

                {/* Segmented toggle */}
                <div
                    className="view-toggle"
                    style={{
                        display: "inline-flex",
                        padding: 4,
                        background: t.toggleBg,
                        border: t.toggleBorder,
                        borderRadius: 14,
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        fontFamily: "'Outfit', sans-serif",
                    }}
                >
                    <button
                        onClick={() => setViewMode("boss")}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            background:
                                viewMode === "boss" ? t.toggleActiveBg : "transparent",
                            color:
                                viewMode === "boss"
                                    ? t.toggleActiveText
                                    : t.toggleInactiveText,
                            letterSpacing: "0.2px",
                        }}
                    >
                      Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode("rep")}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            background:
                                viewMode === "rep" ? t.toggleActiveBg : "transparent",
                            color:
                                viewMode === "rep"
                                    ? t.toggleActiveText
                                    : t.toggleInactiveText,
                            letterSpacing: "0.2px",
                        }}
                    >
                        Field Rep Entry
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === "boss" ? <BossDashboard /> : <FieldRepEntryForm />}
        </div>
    );
};

export default StockTrackerScreen;