"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { Shield, Award, Pencil, Eye, EyeOff, Trash2, AlertTriangle, Key, Smartphone, X } from "lucide-react"

function maskEmail(email: string) {
    const [local, domain] = email.split("@")
    return "*".repeat(Math.max(local.length, 4)) + "@" + domain
}

function maskPhone(phone: string) {
    return "*".repeat(Math.max(phone.length - 4, 4)) + phone.slice(-4)
}

export default function SettingPage() {
    const { resolvedTheme } = useTheme()
    const { data: session } = useSession()
    const isDark = resolvedTheme === "dark"

    const [activeTab, setActiveTab] = useState<"security" | "standing">("security")
    const [emailRevealed, setEmailRevealed] = useState(false)
    const [phoneRevealed, setPhoneRevealed] = useState(false)

    const userName = session?.user?.name || "Shop Intel"
    const userEmail = session?.user_entity?.email || "shopintel@gmail.com"
    const userRole = session?.user_entity?.role || "ADMIN"
    const userPhone = "+60123454914"
    const userUsername = userName.toLowerCase().replace(/\s+/g, "") + "_"

    const bg = isDark ? "#1e1e2e" : "#ffffff"
    const cardBg = isDark ? "#2b2d3a" : "#f3f4f6"
    const textPrimary = isDark ? "#e5e7eb" : "#111827"
    const textSecondary = isDark ? "#9ca3af" : "#6b7280"
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const accentPurple = "#7c3aed"
    const accentRed = "#ef4444"
    const accentRedSoft = isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"
    const revealColor = "#818cf8"

    const sectionStyle: React.CSSProperties = { marginBottom: 32 }
    const sectionTitleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }
    const sectionDescStyle: React.CSSProperties = { fontSize: 13, color: textSecondary, margin: "0 0 14px", lineHeight: 1.5 }

    const btnPurple: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10,
        background: accentPurple, border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s",
    }
    const btnRedSolid: React.CSSProperties = {
        ...btnPurple, background: accentRed,
    }
    const btnRedOutline: React.CSSProperties = {
        ...btnPurple, background: "transparent", border: `1px solid ${accentRed}`, color: accentRed,
    }

    const fieldRow = (label: string, value: string, options?: {
        masked?: boolean, revealed?: boolean, onReveal?: () => void,
        onEdit?: () => void, onRemove?: () => void
    }) => (
        <div
            style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderBottom: `1px solid ${borderColor}`, flexWrap: "wrap", gap: 8,
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: textSecondary, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 14, color: textPrimary, margin: 0, wordBreak: "break-all" }}>
                        {options?.masked && !options?.revealed ? (label === "Email" ? maskEmail(value) : maskPhone(value)) : value}
                    </p>
                    {options?.masked && (
                        <button
                            onClick={options.onReveal}
                            style={{ background: "none", border: "none", color: revealColor, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                        >
                            {options.revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            {options.revealed ? "Hide" : "Reveal"}
                        </button>
                    )}
                </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                {options?.onRemove && (
                    <button style={{ ...btnRedOutline, padding: "6px 14px", fontSize: 12 }}>Remove</button>
                )}
                {options?.onEdit && (
                    <button style={{ padding: "6px 14px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb", border: "none", color: textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "8px 0 60px" }}>
            {/* Page title */}
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: "0 0 24px" }}>My Account</h1>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 24, marginBottom: 28, borderBottom: `2px solid ${borderColor}` }}>
                {(["security", "standing"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${accentPurple}` : "2px solid transparent",
                            padding: "10px 4px", marginBottom: -2, color: activeTab === tab ? accentPurple : textSecondary,
                            fontSize: 14, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit",
                            transition: "color 0.2s, border-color 0.2s",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === "security" ? (
                <>
                    {/* Profile Card */}
                    <div style={{ borderRadius: 16, overflow: "hidden", background: cardBg, marginBottom: 32 }}>
                        {/* Banner */}
                        <div style={{ height: 100, background: "linear-gradient(135deg, #c026d3, #e11d9d, #a21caf)", position: "relative" }} />

                        {/* Avatar + info */}
                        <div style={{ padding: "0 20px 20px", position: "relative" }}>
                            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -40, flexWrap: "wrap", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src="/Icon.png"
                                            alt="avatar"
                                            style={{
                                                width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                                                border: `4px solid ${cardBg}`,
                                            }}
                                        />
                                        <div style={{
                                            position: "absolute", bottom: 4, right: 4, width: 14, height: 14,
                                            borderRadius: "50%", background: "#22c55e", border: `3px solid ${cardBg}`,
                                        }} />
                                    </div>
                                    <div style={{ paddingBottom: 6 }}>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: 0 }}>{userName}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                width: 20, height: 20, borderRadius: 6,
                                                background: "linear-gradient(135deg, #06b6d4, #14b8a6)",
                                                fontSize: 11, fontWeight: 800, color: "#fff",
                                            }}>#</span>
                                        </div>
                                    </div>
                                </div>
                                <button style={{ ...btnPurple, padding: "8px 16px", fontSize: 13 }}>
                                    <Pencil size={14} /> Edit User Profile
                                </button>
                            </div>
                        </div>

                        {/* Field rows */}
                        {fieldRow("Display Name", "You haven't added a display name yet.", { onEdit: () => {} })}
                        {fieldRow("Username", userUsername, { onEdit: () => {} })}
                        {fieldRow("Email", userEmail, { masked: true, revealed: emailRevealed, onReveal: () => setEmailRevealed(!emailRevealed), onEdit: () => {} })}
                        {fieldRow("Phone Number", userPhone, { masked: true, revealed: phoneRevealed, onReveal: () => setPhoneRevealed(!phoneRevealed), onEdit: () => {}, onRemove: () => {} })}
                    </div>

                    {/* Password and Authentication */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>Password and Authentication</h2>
                        <button style={btnPurple}>Change Password</button>
                    </div>

                    {/* Authenticator App */}
                    <div style={sectionStyle}>
                        <h3 style={{ ...sectionTitleStyle, fontSize: 16 }}>Authenticator App</h3>
                        <p style={sectionDescStyle}>
                            Protect your account with an extra layer of security. Once configured, you&apos;ll be required to enter your password and complete one additional step in order to sign in.
                        </p>
                        <button style={btnPurple}>
                            <Smartphone size={15} /> Enable Authenticator App
                        </button>
                    </div>

                    {/* Security Keys */}
                    <div style={sectionStyle}>
                        <h3 style={{ ...sectionTitleStyle, fontSize: 16 }}>Security Keys</h3>
                        <p style={sectionDescStyle}>
                            Add an additional layer of protection to your account with a Security Key.
                        </p>
                        <button style={btnPurple}>
                            <Key size={15} /> Register a Security Key
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: borderColor, margin: "16px 0 28px" }} />

                    {/* Account Removal */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>Account Removal</h2>
                        <p style={sectionDescStyle}>
                            Disabling your account means you can recover it at any time after taking this action.
                        </p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button style={btnRedSolid}>
                                <AlertTriangle size={14} /> Disable Account
                            </button>
                            <button style={btnRedOutline}>
                                <Trash2 size={14} /> Delete Account
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* Standing tab */
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 16px",
                    }}>
                        <Award size={28} color={accentPurple} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: "0 0 8px" }}>Good Standing</h2>
                    <p style={{ fontSize: 14, color: textSecondary, margin: 0, lineHeight: 1.6, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                        Your account is in good standing. There are no warnings or violations associated with your account.
                    </p>
                </div>
            )}
        </div>
    )
}
