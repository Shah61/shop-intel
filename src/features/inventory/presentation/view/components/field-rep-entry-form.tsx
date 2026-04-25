"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { addVisit } from "../../tanstack/stock-visit-store";

interface ExpiryBatch {
    id: string;
    expiryDate: string;
    quantity: number;
}

interface ProductEntry {
    productId: string;
    productName: string;
    currentStock: number;
    batches: ExpiryBatch[];
}

const SUPERMARKETS = [
    { id: "aeon-shah-alam", name: "AEON Shah Alam" },
    { id: "lotus-klang", name: "Lotus's Klang" },
    { id: "village-grocer-bangsar", name: "Village Grocer Bangsar" },
    { id: "jaya-grocer-kl", name: "Jaya Grocer KL" },
    { id: "mydin-subang", name: "Mydin Subang" },
];

const PRODUCTS = [
    { id: "fresh-250", name: "Fresh Milk 250ml" },
    { id: "fresh-1l", name: "Fresh Milk 1L" },
    { id: "low-fat-1l", name: "Low Fat Milk 1L" },
    { id: "choco-250", name: "Chocolate Milk 250ml" },
    { id: "strawberry-250", name: "Strawberry Milk 250ml" },
];

const FieldRepEntryForm = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [supermarket, setSupermarket] = useState("");
    const [visitNotes, setVisitNotes] = useState("");
    const [shelfPhoto, setShelfPhoto] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductEntry[]>([
        {
            productId: "",
            productName: "",
            currentStock: 0,
            batches: [{ id: crypto.randomUUID(), expiryDate: "", quantity: 0 }],
        },
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                innerCardBg: "rgba(15, 20, 28, 0.5)",
                innerCardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "hsl(var(--foreground))",
                subtitle: "hsl(var(--muted-foreground))",
                label: "hsl(var(--muted-foreground))",
                input: "hsl(var(--foreground))",
                inputBg: "rgba(15, 20, 28, 0.6)",
                inputBorder: "rgba(var(--preset-primary-rgb), 0.15)",
                divider: "rgba(var(--preset-primary-rgb), 0.1)",
                addBtnBg: "rgba(var(--preset-primary-rgb), 0.12)",
                addBtnColor: "var(--preset-lighter)",
                submitBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                photoBg: "rgba(var(--preset-primary-rgb), 0.06)",
                photoBorder: "rgba(var(--preset-primary-rgb), 0.2)",
                successBg: "rgba(34, 197, 94, 0.12)",
                successBorder: "rgba(34, 197, 94, 0.3)",
                successText: "rgb(134, 239, 172)",
            };
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            innerCardBg: "rgba(255, 255, 255, 0.7)",
            innerCardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.08)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "hsl(var(--foreground))",
            subtitle: "hsl(var(--muted-foreground))",
            label: "hsl(var(--muted-foreground))",
            input: "hsl(var(--foreground))",
            inputBg: "rgba(255, 255, 255, 0.8)",
            inputBorder: "rgba(var(--preset-primary-rgb), 0.15)",
            divider: "rgba(var(--preset-primary-rgb), 0.1)",
            addBtnBg: "rgba(var(--preset-primary-rgb), 0.08)",
            addBtnColor: "var(--preset-primary)",
            submitBg: "linear-gradient(135deg, var(--preset-lighter), var(--preset-primary))",
            photoBg: "rgba(var(--preset-primary-rgb), 0.04)",
            photoBorder: "rgba(var(--preset-primary-rgb), 0.18)",
            successBg: "rgba(34, 197, 94, 0.1)",
            successBorder: "rgba(34, 197, 94, 0.25)",
            successText: "rgb(21, 128, 61)",
        };
    }, [isDark]);

    const now = new Date();
    const dateTimeLabel = now.toLocaleString("en-MY", {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 14px", fontSize: 14, fontFamily: "'Outfit', sans-serif",
        background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12,
        color: t.input, outline: "none", transition: "border-color 0.2s ease",
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 12, color: t.label, fontWeight: 500, marginBottom: 6, display: "block",
        textTransform: "uppercase", letterSpacing: "0.5px",
    };

    const addProduct = () => {
        setProducts((prev) => [...prev, {
            productId: "", productName: "", currentStock: 0,
            batches: [{ id: crypto.randomUUID(), expiryDate: "", quantity: 0 }],
        }]);
    };

    const removeProduct = (index: number) => setProducts((prev) => prev.filter((_, i) => i !== index));

    const updateProduct = (index: number, patch: Partial<ProductEntry>) =>
        setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));

    const addBatch = (productIndex: number) =>
        setProducts((prev) => prev.map((p, i) =>
            i === productIndex
                ? { ...p, batches: [...p.batches, { id: crypto.randomUUID(), expiryDate: "", quantity: 0 }] }
                : p
        ));

    const removeBatch = (productIndex: number, batchId: string) =>
        setProducts((prev) => prev.map((p, i) =>
            i === productIndex ? { ...p, batches: p.batches.filter((b) => b.id !== batchId) } : p
        ));

    const updateBatch = (productIndex: number, batchId: string, patch: Partial<ExpiryBatch>) =>
        setProducts((prev) => prev.map((p, i) =>
            i === productIndex
                ? { ...p, batches: p.batches.map((b) => (b.id === batchId ? { ...b, ...patch } : b)) }
                : p
        ));

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setShelfPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        setSubmitting(true);
        const supermarketObj = SUPERMARKETS.find((s) => s.id === supermarket);
        if (!supermarketObj) {
            setSubmitting(false);
            return;
        }

        // Write to shared store — boss dashboard picks it up automatically
        addVisit({
            supermarketId: supermarket,
            supermarketName: supermarketObj.name,
            timestamp: new Date().toISOString(),
            notes: visitNotes,
            photo: shelfPhoto,
            products: products.map((p) => ({
                productId: p.productId,
                productName: p.productName,
                currentStock: p.currentStock,
                batches: p.batches
                    .filter((b) => b.expiryDate && b.quantity > 0)
                    .map((b) => ({ expiryDate: b.expiryDate, quantity: b.quantity })),
            })),
        });

        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            // Reset form for next store
            setSupermarket("");
            setVisitNotes("");
            setShelfPhoto(null);
            setProducts([{
                productId: "", productName: "", currentStock: 0,
                batches: [{ id: crypto.randomUUID(), expiryDate: "", quantity: 0 }],
            }]);
            setTimeout(() => setSubmitted(false), 3500);
        }, 700);
    };

    const isValid =
        supermarket &&
        products.every(
            (p) =>
                p.productId &&
                p.currentStock >= 0 &&
                p.batches.every((b) => b.expiryDate && b.quantity > 0)
        );

    return (
        <div
            className="field-rep-form"
            style={{
                background: t.cardBg, borderRadius: 20, border: t.cardBorder,
                padding: "24px 26px", position: "relative", overflow: "hidden",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                fontFamily: "'Outfit', sans-serif",
                maxWidth: 760, margin: "0 auto", width: "100%",
            }}
        >
            <div style={{
                position: "absolute", top: -60, right: -60, width: 180, height: 180,
                background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`,
                pointerEvents: "none",
            }} />

            <div style={{ marginBottom: 20, position: "relative" }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px" }}>
                    New Store Visit
                </h3>
                <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                    {dateTimeLabel}
                </p>
            </div>

            {submitted && (
                <div style={{
                    background: t.successBg, border: `1px solid ${t.successBorder}`,
                    borderRadius: 12, padding: "12px 14px", marginBottom: 16,
                    display: "flex", alignItems: "center", gap: 10,
                    color: t.successText, fontSize: 13, fontWeight: 500,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Visit submitted — Dashboard updated. Next store?
                </div>
            )}

            <div style={{ marginBottom: 18, position: "relative" }}>
                <label style={labelStyle}>Supermarket</label>
                <select
                    value={supermarket}
                    onChange={(e) => setSupermarket(e.target.value)}
                    style={inputStyle}
                >
                    <option value="">Select a store</option>
                    {SUPERMARKETS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: 18, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Products on shelf</label>
                    <span style={{ fontSize: 11, color: t.subtitle, fontWeight: 400 }}>
                        {products.length} item{products.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {products.map((product, pIdx) => (
                        <div key={pIdx} style={{
                            background: t.innerCardBg, border: t.innerCardBorder,
                            borderRadius: 14, padding: 14,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 600, color: t.subtitle,
                                    textTransform: "uppercase", letterSpacing: "0.5px",
                                }}>
                                    Product #{pIdx + 1}
                                </span>
                                {products.length > 1 && (
                                    <button
                                        onClick={() => removeProduct(pIdx)}
                                        style={{
                                            background: "transparent", border: "none",
                                            color: t.subtitle, cursor: "pointer", fontSize: 12, padding: 4,
                                        }}
                                    >
                                        ✕ Remove
                                    </button>
                                )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10, marginBottom: 12 }}>
                                <div>
                                    <label style={labelStyle}>Product</label>
                                    <select
                                        value={product.productId}
                                        onChange={(e) => {
                                            const selected = PRODUCTS.find((p) => p.id === e.target.value);
                                            updateProduct(pIdx, {
                                                productId: e.target.value,
                                                productName: selected?.name || "",
                                            });
                                        }}
                                        style={inputStyle}
                                    >
                                        <option value="">Select product</option>
                                        {PRODUCTS.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>On shelf</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={product.currentStock}
                                        onChange={(e) => updateProduct(pIdx, { currentStock: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: `1px dashed ${t.divider}`, paddingTop: 12 }}>
                                <label style={labelStyle}>Expiry batches</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {product.batches.map((batch) => (
                                        <div key={batch.id} style={{
                                            display: "grid", gridTemplateColumns: "1fr 90px 32px",
                                            gap: 8, alignItems: "center",
                                        }}>
                                            <input
                                                type="date"
                                                value={batch.expiryDate}
                                                onChange={(e) => updateBatch(pIdx, batch.id, { expiryDate: e.target.value })}
                                                style={{ ...inputStyle, padding: "10px 12px" }}
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="Qty"
                                                value={batch.quantity || ""}
                                                onChange={(e) => updateBatch(pIdx, batch.id, { quantity: Number(e.target.value) })}
                                                style={{ ...inputStyle, padding: "10px 12px" }}
                                            />
                                            <button
                                                onClick={() => removeBatch(pIdx, batch.id)}
                                                disabled={product.batches.length === 1}
                                                style={{
                                                    background: "transparent", border: `1px solid ${t.inputBorder}`,
                                                    borderRadius: 10, color: t.subtitle,
                                                    cursor: product.batches.length === 1 ? "not-allowed" : "pointer",
                                                    fontSize: 14, height: 40,
                                                    opacity: product.batches.length === 1 ? 0.4 : 1,
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => addBatch(pIdx)}
                                    style={{
                                        background: t.addBtnBg, border: "none", color: t.addBtnColor,
                                        padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                                        cursor: "pointer", marginTop: 10, fontFamily: "'Outfit', sans-serif",
                                    }}
                                >
                                    + Add another batch
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addProduct}
                    style={{
                        background: "transparent", border: `1.5px dashed ${t.inputBorder}`,
                        color: t.addBtnColor, padding: "12px", borderRadius: 12,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        width: "100%", marginTop: 10, fontFamily: "'Outfit', sans-serif",
                    }}
                >
                    + Add another product
                </button>
            </div>

            <div style={{ marginBottom: 18, position: "relative" }}>
                <label style={labelStyle}>Shelf photo (optional)</label>
                <label
                    htmlFor="shelf-photo"
                    style={{
                        background: t.photoBg, border: `1.5px dashed ${t.photoBorder}`,
                        borderRadius: 12, padding: shelfPhoto ? 8 : 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", minHeight: 90, transition: "all 0.2s ease",
                    }}
                >
                    {shelfPhoto ? (
                        <img
                            src={shelfPhoto}
                            alt="Shelf"
                            style={{ maxHeight: 160, borderRadius: 8, objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: t.subtitle }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>Tap to take photo</span>
                        </div>
                    )}
                </label>
                <input
                    id="shelf-photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhoto}
                    style={{ display: "none" }}
                />
            </div>

            <div style={{ marginBottom: 20, position: "relative" }}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="e.g. Shelf tag missing, competitor ran a promo..."
                    rows={2}
                    style={{
                        ...inputStyle, resize: "vertical",
                        minHeight: 60, fontFamily: "'Outfit', sans-serif",
                    }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                style={{
                    width: "100%", padding: "14px",
                    background: isValid && !submitting ? t.submitBg : "rgba(128, 128, 128, 0.2)",
                    border: "none", borderRadius: 14, color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    cursor: isValid && !submitting ? "pointer" : "not-allowed",
                    letterSpacing: "0.3px", fontFamily: "'Outfit', sans-serif",
                    transition: "all 0.2s ease", position: "relative",
                    opacity: isValid && !submitting ? 1 : 0.5,
                }}
            >
                {submitting ? "Submitting..." : "Submit visit"}
            </button>
        </div>
    );
};

export default FieldRepEntryForm;