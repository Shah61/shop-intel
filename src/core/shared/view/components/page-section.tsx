interface PageSectionProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function PageSection({ title, description, action, children, className = "" }: PageSectionProps) {
    return (
        <section className={`space-y-4 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-0.5 max-w-xl">{description}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, badge, actions, className = "" }: PageHeaderProps) {
    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {badge && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
