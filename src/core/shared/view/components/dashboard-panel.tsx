"use client";

interface DashboardPanelProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

/**
 * Shared panel for dashboard blocks: consistent border, padding, title + description.
 * Use for charts, tables, and list blocks across Sales, Inventory, etc.
 */
export function DashboardPanel({
    title,
    description,
    actions,
    children,
    className = "",
    footer,
}: DashboardPanelProps) {
    return (
        <div
            className={
                "rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col " +
                className
            }
        >
            <div className="px-5 py-4 border-b border-border/80 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
            {footer && (
                <div className="px-5 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground">
                    {footer}
                </div>
            )}
        </div>
    );
}
