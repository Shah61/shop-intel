import { TrendingUp, TrendingDown } from "lucide-react";

export type CardVariant = "blue" | "emerald" | "violet" | "amber" | "rose" | "orange" | "cyan" | "neutral";

const variantStyles: Record<CardVariant, { bg: string; iconBg: string; ring: string }> = {
    blue: {
        bg: "bg-blue-50/80 dark:bg-blue-500/[0.06]",
        iconBg: "bg-blue-500/10 dark:bg-blue-400/15",
        ring: "ring-blue-100 dark:ring-blue-500/10",
    },
    emerald: {
        bg: "bg-emerald-50/80 dark:bg-emerald-500/[0.06]",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-400/15",
        ring: "ring-emerald-100 dark:ring-emerald-500/10",
    },
    violet: {
        bg: "bg-violet-50/80 dark:bg-violet-500/[0.06]",
        iconBg: "bg-violet-500/10 dark:bg-violet-400/15",
        ring: "ring-violet-100 dark:ring-violet-500/10",
    },
    amber: {
        bg: "bg-amber-50/80 dark:bg-amber-500/[0.06]",
        iconBg: "bg-amber-500/10 dark:bg-amber-400/15",
        ring: "ring-amber-100 dark:ring-amber-500/10",
    },
    rose: {
        bg: "bg-rose-50/80 dark:bg-rose-500/[0.06]",
        iconBg: "bg-rose-500/10 dark:bg-rose-400/15",
        ring: "ring-rose-100 dark:ring-rose-500/10",
    },
    orange: {
        bg: "bg-orange-50/80 dark:bg-orange-500/[0.06]",
        iconBg: "bg-orange-500/10 dark:bg-orange-400/15",
        ring: "ring-orange-100 dark:ring-orange-500/10",
    },
    cyan: {
        bg: "bg-cyan-50/80 dark:bg-cyan-500/[0.06]",
        iconBg: "bg-cyan-500/10 dark:bg-cyan-400/15",
        ring: "ring-cyan-100 dark:ring-cyan-500/10",
    },
    neutral: {
        bg: "bg-white dark:bg-card",
        iconBg: "bg-muted dark:bg-muted",
        ring: "ring-border/60",
    },
};

interface DataCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    trending?: "up" | "down";
    change?: string;
    isLoading?: boolean;
    description?: string;
    variant?: CardVariant;
}

const DataCard = ({
    icon,
    title,
    value,
    trending,
    change,
    isLoading,
    description,
    variant = "neutral",
}: DataCardProps) => {
    const styles = variantStyles[variant];

    return (
        <div
            className={`
                ${styles.bg} rounded-2xl p-5 ring-1 ${styles.ring}
                transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.03]
            `}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}
                >
                    {icon}
                </div>
                <span className="text-[13px] font-medium text-muted-foreground">
                    {title}
                </span>
            </div>

            {isLoading ? (
                <div className="space-y-2.5">
                    <div className="h-8 w-28 bg-foreground/5 rounded-lg animate-pulse" />
                    <div className="h-3.5 w-20 bg-foreground/5 rounded animate-pulse" />
                </div>
            ) : (
                <>
                    <div className="flex items-end justify-between gap-3 mb-2">
                        <p className="text-[28px] font-bold tracking-tight leading-none">
                            {value}
                        </p>
                        {trending && change && (
                            <span
                                className={`
                                    inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0
                                    ${
                                        trending === "up"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                            : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                                    }
                                `}
                            >
                                {trending === "up" ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {change}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {description ?? "Compared to previous period"}
                    </p>
                </>
            )}
        </div>
    );
};

export default DataCard;
