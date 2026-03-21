"use client";

import React, { useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompetitorCard } from "../components/competitors/competitor-card";
import { CompetitorsTable } from "../components/competitors/competitors-table";
import { MOCK_COMPETITORS } from "@/src/features/intelligence/data/mock-competitors";
import { cn } from "@/lib/utils";

export type CompetitorsViewMode = "cards" | "table";

const CompetitorsScreen: React.FC = () => {
    const [view, setView] = useState<CompetitorsViewMode>("cards");

    return (
        <div className="flex flex-col gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Competitors</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                        Benchmark signals vs tracked competitors. Switch between cards and a compact table.
                    </p>
                </div>

                <div
                    className="inline-flex rounded-lg border border-border bg-muted/40 p-1 gap-1"
                    role="group"
                    aria-label="View mode"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 rounded-md",
                            view === "cards" && "bg-card shadow-sm text-foreground"
                        )}
                        onClick={() => setView("cards")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Cards
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 rounded-md",
                            view === "table" && "bg-card shadow-sm text-foreground"
                        )}
                        onClick={() => setView("table")}
                    >
                        <Table2 className="h-4 w-4" />
                        Table
                    </Button>
                </div>
            </div>

            {view === "cards" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {MOCK_COMPETITORS.map((c) => (
                        <CompetitorCard key={c.id} competitor={c} />
                    ))}
                </div>
            ) : (
                <CompetitorsTable rows={MOCK_COMPETITORS} />
            )}
        </div>
    );
};

export default CompetitorsScreen;
