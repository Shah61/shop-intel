"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { logoutMutation } from "@/src/features/auth/presentation/tanstack/auth-tanstack"
import {
    LayoutDashboard,
    ShoppingBag,
    Brain,
    Megaphone,
    Warehouse,
    Store,
    Users,
    Activity,
    Settings,
    Sun,
    Moon,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Layout,
} from "lucide-react"
import LayoutDrawer, { getStored, PRESET_COLORS, type NavLayout, type NavColor, type PresetColor } from "./layout-drawer"

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
}

/* ─── Role shimmer badge ─── */
function RoleBadge({ role = "STAFF", accent, accentLighter }: { role?: string; accent?: string; accentLighter?: string }) {
    const c1 = accent || "#7c3aed"
    const c2 = accentLighter || "#a78bfa"
    const rgb = hexToRgb(c1)
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                boxShadow: `0 2px 8px rgba(${rgb}, 0.35)`,
                borderRadius: 5,
                padding: "1px 7px",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                color: "#fff",
                lineHeight: 1.7,
                flexShrink: 0,
            }}
        >
            <span style={{ position: "relative", zIndex: 1 }}>{role}</span>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer-badge 2s infinite linear",
                }}
            />
            <style>{`
                @keyframes shimmer-badge {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </span>
    )
}

/* ─── Animated collapse ─── */
function AnimatedCollapse({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)
    const [shouldRender, setShouldRender] = useState(isOpen)

    useEffect(() => {
        if (isOpen) setShouldRender(true)
    }, [isOpen])

    useEffect(() => {
        if (ref.current) setHeight(isOpen ? ref.current.scrollHeight : 0)
    }, [isOpen, shouldRender])

    const handleTransitionEnd = () => {
        if (!isOpen) setShouldRender(false)
    }

    return (
        <div
            style={{ height, overflow: "hidden", transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)", willChange: "height" }}
            onTransitionEnd={handleTransitionEnd}
        >
            <div ref={ref}>{shouldRender && children}</div>
        </div>
    )
}

/* ─── Staggered child item (vertical timeline) ─── */
function ChildItem({
    child,
    iconSrc,
    index,
    isOpen,
    isLast,
    active,
    onClick,
    t,
}: {
    child: string
    iconSrc?: string
    index: number
    isOpen: boolean
    isLast: boolean
    active: boolean
    onClick: () => void
    t: Record<string, string>
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setVisible(true), 80 + index * 50)
            return () => clearTimeout(timer)
        }
        setVisible(false)
    }, [isOpen, index])

    const lineColor = t.dashLine

    return (
        <button
            onClick={onClick}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px 9px 50px",
                border: "none",
                background: active ? t.activeChildBg : "transparent",
                cursor: "pointer",
                color: active ? t.activeText : t.childText,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                fontFamily: "'Outfit', -apple-system, sans-serif",
                position: "relative",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1), color 0.15s ease, background 0.15s ease",
                borderRadius: 8,
            }}
            onMouseOver={(e) => {
                if (!active) {
                    e.currentTarget.style.color = t.hoverText
                    e.currentTarget.style.background = t.hoverBg
                }
            }}
            onMouseOut={(e) => {
                if (!active) {
                    e.currentTarget.style.color = t.childText
                    e.currentTarget.style.background = "transparent"
                }
            }}
        >
            {/* Curved L-branch: vertical from top → curves → horizontal to content */}
            <span
                style={{
                    position: "absolute",
                    left: 32,
                    top: 0,
                    width: 12,
                    height: "50%",
                    borderLeft: `1.5px solid ${lineColor}`,
                    borderBottom: `1.5px solid ${lineColor}`,
                    borderBottomLeftRadius: 8,
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.35s ease 0.05s",
                    pointerEvents: "none",
                }}
            />
            {/* Vertical line continuation below the branch (all items except last) */}
            {!isLast && (
                <span
                    style={{
                        position: "absolute",
                        left: 32,
                        top: "50%",
                        bottom: 0,
                        width: 0,
                        borderLeft: `1.5px solid ${lineColor}`,
                        opacity: visible ? 1 : 0,
                        transition: "opacity 0.35s ease 0.05s",
                        pointerEvents: "none",
                    }}
                />
            )}
            {iconSrc && (
                <img src={iconSrc} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "contain", flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child}</span>
        </button>
    )
}

/* ─── Popover child (collapsed mode) ─── */
function PopoverChild({ child, iconSrc, active, onClick, t }: { child: string; iconSrc?: string; active: boolean; onClick: () => void; t: Record<string, string> }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                border: "none",
                background: active ? t.activeChildBg : "transparent",
                cursor: "pointer",
                color: active ? t.activeText : t.childText,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                fontFamily: "'Outfit', -apple-system, sans-serif",
                textAlign: "left",
                transition: "color 0.15s ease, background 0.15s ease",
                borderRadius: 8,
                margin: "0 6px",
                width: "calc(100% - 12px)",
            }}
            onMouseOver={(e) => {
                if (!active) {
                    e.currentTarget.style.background = t.hoverBg
                    e.currentTarget.style.color = t.hoverText
                }
            }}
            onMouseOut={(e) => {
                if (!active) {
                    e.currentTarget.style.background = active ? t.activeChildBg : "transparent"
                    e.currentTarget.style.color = active ? t.activeText : t.childText
                }
            }}
        >
            {iconSrc && (
                <img src={iconSrc} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "contain", flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child}</span>
        </button>
    )
}

/* ─── Menu item config ─── */
interface MenuItem {
    id: string
    label: string
    icon: React.ReactNode
    path?: string
    children?: { id: string; label: string; path: string; iconSrc?: string }[]
}

export default function AppSidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { resolvedTheme, setTheme } = useTheme()
    const { data: session } = useSession()
    const { mutate: logout } = logoutMutation()
    const isDark = resolvedTheme === "dark"

    const [collapsed, setCollapsed] = useState(false)
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
    const [activePopover, setActivePopover] = useState<string | null>(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
    const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null)
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showProfilePopover, setShowProfilePopover] = useState(false)
    const [layoutDrawerOpen, setLayoutDrawerOpen] = useState(false)
    const [layoutPreset, setLayoutPreset] = useState<PresetColor>(() => getStored("layout-preset", "purple"))
    const [layoutNavColor, setLayoutNavColor] = useState<NavColor>(() => getStored("layout-nav-color", "apparent"))
    const [layoutNavLayout, setLayoutNavLayout] = useState<NavLayout>(() => getStored("layout-nav", "vertical"))
    const profileRef = useRef<HTMLDivElement>(null)
    const [profilePopoverPos, setProfilePopoverPos] = useState({ top: 0, left: 0 })
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const pc = PRESET_COLORS[layoutPreset]
    const pcRgb = hexToRgb(pc.primary)
    const isIntegrate = layoutNavColor === "integrate"

    const t = useMemo(() => {
        if (isDark) {
            if (isIntegrate) {
                return {
                    sidebarBg: "#131920",
                    sidebarBorder: `rgba(255, 255, 255, 0.1)`,
                    sectionLabel: "rgba(255, 255, 255, 0.4)",
                    itemText: "rgba(255, 255, 255, 0.7)",
                    hoverText: "#fff",
                    hoverBg: "rgba(255, 255, 255, 0.1)",
                    activeText: "#fff",
                    activeBg: "rgba(255, 255, 255, 0.16)",
                    activeChildBg: "rgba(255, 255, 255, 0.12)",
                    childText: "rgba(255, 255, 255, 0.6)",
                    dashLine: "rgba(255, 255, 255, 0.2)",
                    popoverBg: "#131820",
                    popoverShadow: `0 0 2px rgba(${pcRgb},0.2), 0 16px 32px -4px rgba(0,0,0,0.5)`,
                    toggleBg: "rgba(255, 255, 255, 0.1)",
                    toggleBorder: "rgba(255, 255, 255, 0.15)",
                    toggleKnob: "#fff",
                    collapseBg: "rgba(255, 255, 255, 0.1)",
                    collapseBorder: "rgba(255, 255, 255, 0.2)",
                    collapseIcon: "#fff",
                    logoBg: pc.gradient,
                    logoText: "#fff",
                    divider: "rgba(255, 255, 255, 0.08)",
                    userText: "#fff",
                    userSub: "rgba(255, 255, 255, 0.6)",
                    accent: pc.primary,
                    accentLighter: pc.lighter,
                }
            }
            return {
                sidebarBg: "#131920",
                sidebarBorder: `rgba(${pcRgb}, 0.1)`,
                sectionLabel: "rgba(156, 163, 175, 0.5)",
                itemText: "#9ca3af",
                hoverText: "#d1d5db",
                hoverBg: `rgba(${pcRgb}, 0.08)`,
                activeText: pc.lighter,
                activeBg: `rgba(${pcRgb}, 0.12)`,
                activeChildBg: `rgba(${pcRgb}, 0.1)`,
                childText: "#9ca3af",
                dashLine: `rgba(${pcRgb}, 0.2)`,
                popoverBg: "#131820",
                popoverShadow: `0 0 2px rgba(${pcRgb},0.2), 0 16px 32px -4px rgba(0,0,0,0.5)`,
                toggleBg: `rgba(${pcRgb}, 0.1)`,
                toggleBorder: `rgba(${pcRgb}, 0.15)`,
                toggleKnob: pc.primary,
                collapseBg: `rgba(${pcRgb}, 0.1)`,
                collapseBorder: `rgba(${pcRgb}, 0.2)`,
                collapseIcon: pc.lighter,
                logoBg: pc.gradient,
                logoText: "#fff",
                divider: `rgba(${pcRgb}, 0.08)`,
                userText: "#d1d5db",
                userSub: "#9ca3af",
                accent: pc.primary,
                accentLighter: pc.lighter,
            }
        }
        // Light mode: always use a clean white sidebar background,
        // regardless of the selected nav color preset.
        return {
            sidebarBg: "#ffffff",
            sidebarBorder: `rgba(${pcRgb}, 0.08)`,
            sectionLabel: `rgba(${pcRgb}, 0.4)`,
            itemText: "#5a4a70",
            hoverText: "#1a1025",
            hoverBg: `rgba(${pcRgb}, 0.06)`,
            activeText: pc.primary,
            activeBg: `rgba(${pcRgb}, 0.08)`,
            activeChildBg: `rgba(${pcRgb}, 0.06)`,
            childText: "#8b7aa0",
            dashLine: `rgba(${pcRgb}, 0.18)`,
            popoverBg: "#ffffff",
            popoverShadow: "0 0 2px rgba(145,158,171,0.24), 0 16px 32px -4px rgba(145,158,171,0.24)",
            toggleBg: `rgba(${pcRgb}, 0.06)`,
            toggleBorder: `rgba(${pcRgb}, 0.12)`,
            toggleKnob: pc.primary,
            collapseBg: "#fff",
            collapseBorder: `rgba(${pcRgb}, 0.15)`,
            collapseIcon: pc.primary,
            logoBg: pc.gradient,
            logoText: "#fff",
            divider: `rgba(${pcRgb}, 0.06)`,
            userText: "#1a1025",
            userSub: "#8b7aa0",
            accent: pc.primary,
            accentLighter: pc.lighter,
        }
    }, [isDark, pc, pcRgb, isIntegrate])

    // Expose preset colors to CSS so Sales pages (Overview, TikTok, Shopee, Shopify, Facebook, WooCommerce) can use var(--preset-primary) etc.
    useEffect(() => {
        document.documentElement.style.setProperty("--preset-primary", pc.primary)
        document.documentElement.style.setProperty("--preset-lighter", pc.lighter)
        document.documentElement.style.setProperty("--preset-primary-rgb", pcRgb)
    }, [pc.primary, pc.lighter, pcRgb])

    const menuItems: MenuItem[] = [
        {
            id: "sales",
            label: "Sales",
            icon: <ShoppingBag size={20} />,
            children: [
                { id: "overview", label: "Overview", path: "/sales" },
                { id: "tiktok", label: "TikTok", path: "/sales?tab=tiktok", iconSrc: "/images/tiktok2.png" },
                { id: "shopee", label: "Shopee", path: "/sales?tab=shopee", iconSrc: "/images/shopee.png" },
                { id: "shopify", label: "Shopify", path: "/sales?tab=shopify", iconSrc: "/images/shopify.png" },
                { id: "woocommerce", label: "WooCommerce", path: "/sales?tab=woocommerce", iconSrc: "/images/woocommerce.png" },
            ],
        },
        {
            id: "intelligence",
            label: "Intelligence",
            icon: <Brain size={20} />,
            children: [
                { id: "assistant", label: "Assistant", path: "/intelligence" },
                { id: "trends", label: "Trends", path: "/intelligence?tab=trends" },
                { id: "analysis", label: "Analysis", path: "/intelligence?tab=analysis" },
            ],
        },
        {
            id: "marketing",
            label: "Marketing",
            icon: <Megaphone size={20} />,
            children: [
                { id: "personal", label: "Personal Marketing", path: "/marketing" },
                { id: "facebook", label: "Facebook Marketing", path: "/marketing?tab=facebook", iconSrc: "/images/facebook.png" },
                { id: "ai-generator", label: "AI Generator", path: "/marketing?tab=ai" },
            ],
        },
        {
            id: "inventory",
            label: "Inventory",
            icon: <Warehouse size={20} />,
            children: [
                { id: "inventory-mgmt", label: "Inventory Management", path: "/inventory" },
                { id: "ninjavan", label: "Ninjavan Delivery", path: "/inventory?tab=ninjavan" },
            ],
        },
        {
            id: "physical",
            label: "Physical",
            icon: <Store size={20} />,
            children: [
                { id: "analytics", label: "Analytics", path: "/physical" },
                { id: "product", label: "Product", path: "/physical?tab=product" },
                { id: "categories", label: "Categories", path: "/physical?tab=categories" },
                { id: "orders", label: "Orders", path: "/physical?tab=orders" },
                { id: "collection", label: "Collection", path: "/physical?tab=collection" },
                { id: "discount", label: "Discount", path: "/physical?tab=discount" },
                { id: "staff", label: "Staff", path: "/physical?tab=staff" },
                { id: "sku", label: "SKU", path: "/physical?tab=sku" },
            ],
        },
        {
            id: "affiliates",
            label: "Affiliates",
            icon: <Users size={20} />,
            children: [
                { id: "affiliates-list", label: "Affiliates", path: "/affiliates" },
                { id: "payouts", label: "Payouts", path: "/affiliates?tab=payouts" },
                { id: "commissions", label: "Commissions", path: "/affiliates?tab=commissions" },
            ],
        },
        { id: "user-activity", label: "User Activity", icon: <Activity size={20} />, path: "/user-activity" },
        { id: "setting", label: "Settings", icon: <Settings size={20} />, path: "/setting" },
    ]

    const sectionPrefixes: Record<string, string> = {
        sales: "/sales",
        intelligence: "/intelligence",
        marketing: "/marketing",
        inventory: "/inventory",
        physical: "/physical",
        affiliates: "/affiliates",
    }

    const isItemActive = (item: MenuItem): boolean => {
        if (item.children && sectionPrefixes[item.id]) {
            return pathname.startsWith(sectionPrefixes[item.id])
        }
        if (item.path) {
            return pathname === item.path || pathname.startsWith(item.path + "/")
        }
        return false
    }

    const isChildActive = (child: { id: string; path: string }): boolean => {
        const url = new URL(child.path, "http://x")
        const childPathname = url.pathname
        const childTab = url.searchParams.get("tab")

        if (childTab) {
            return pathname === childPathname && searchParams.get("tab") === childTab
        }
        return pathname === childPathname && !searchParams.get("tab")
    }

    const navigateTo = (path: string) => {
        router.push(path)
        setMobileActiveMenu(null)
    }

    const toggleMenu = (name: string) => {
        if (collapsed) return
        setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }))
    }

    useEffect(() => {
        const newOpen: Record<string, boolean> = {}
        for (const [key, prefix] of Object.entries(sectionPrefixes)) {
            if (pathname.startsWith(prefix)) newOpen[key] = true
        }
        setOpenMenus((prev) => ({ ...prev, ...newOpen }))
    }, [pathname])

    useEffect(() => {
        const handler = () => {
            setLayoutPreset(getStored("layout-preset", "purple"))
            setLayoutNavColor(getStored("layout-nav-color", "apparent"))
            setLayoutNavLayout(getStored("layout-nav", "vertical"))
        }
        window.addEventListener("layout-settings-changed", handler)
        return () => window.removeEventListener("layout-settings-changed", handler)
    }, [])

    useEffect(() => {
        if (layoutNavLayout === "mini") setCollapsed(true)
    }, [layoutNavLayout])

    /* ─── Collapsed popover logic ─── */
    const openRAF = useRef<number | null>(null)
    const switchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = useCallback(
        (name: string) => {
            if (!collapsed) return
            if (leaveTimeout.current) clearTimeout(leaveTimeout.current)
            if (openRAF.current) cancelAnimationFrame(openRAF.current)
            if (switchTimeout.current) clearTimeout(switchTimeout.current)

            const el = itemRefs.current[name]
            const newPos = { top: 0, left: 0 }
            if (el) {
                const rect = el.getBoundingClientRect()
                newPos.top = rect.top
                newPos.left = rect.right + 10
            }

            if (activePopover && activePopover !== name && popoverOpen) {
                setPopoverOpen(false)
                switchTimeout.current = setTimeout(() => {
                    setActivePopover(name)
                    setPopoverPos(newPos)
                    openRAF.current = requestAnimationFrame(() => {
                        openRAF.current = requestAnimationFrame(() => {
                            setPopoverOpen(true)
                        })
                    })
                }, 180)
                return
            }

            setPopoverPos(newPos)
            setActivePopover(name)
            setPopoverOpen(false)
            openRAF.current = requestAnimationFrame(() => {
                openRAF.current = requestAnimationFrame(() => {
                    setPopoverOpen(true)
                })
            })
        },
        [collapsed, activePopover, popoverOpen]
    )

    const handleMouseLeave = useCallback(() => {
        if (!collapsed) return
        leaveTimeout.current = setTimeout(() => {
            setPopoverOpen(false)
            setTimeout(() => setActivePopover(null), 220)
        }, 100)
    }, [collapsed])

    const handlePopoverEnter = useCallback(() => {
        if (leaveTimeout.current) clearTimeout(leaveTimeout.current)
        setPopoverOpen(true)
    }, [])

    const handlePopoverLeave = useCallback(() => {
        leaveTimeout.current = setTimeout(() => {
            setPopoverOpen(false)
            setTimeout(() => setActivePopover(null), 220)
        }, 100)
    }, [])

    const sidebarWidth = collapsed ? 80 : 272

    const popoverItem = menuItems.find((i) => i.id === activePopover && i.children)

    const sidebarContent = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                fontFamily: "'Outfit', -apple-system, sans-serif",
            }}
        >
            {/* Logo / Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    padding: collapsed ? "20px 0" : "20px 18px",
                    transition: "padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    gap: 10,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                    {!collapsed && (
                        <span
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: isDark ? "#9ca3af" : t.userText,
                                whiteSpace: "nowrap",
                                letterSpacing: "-0.3px",
                            }}
                        >
                            Shop Intel
                        </span>
                    )}
                </div>
                <button
                    onClick={() => {
                        if (layoutNavLayout === "mini") return
                        setCollapsed(!collapsed)
                        setOpenMenus({})
                        setActivePopover(null)
                        setPopoverOpen(false)
                    }}
                    className="hidden lg:flex"
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1px solid ${t.collapseBorder}`,
                        background: t.collapseBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                        transition: "transform 0.2s ease",
                    }}
                >
                    {collapsed ? (
                        <ChevronRight size={14} color={t.collapseIcon} />
                    ) : (
                        <ChevronLeft size={14} color={t.collapseIcon} />
                    )}
                </button>
            </div>

            <div style={{ height: 1, background: t.divider, margin: "0 16px" }} />

            {/* Scrollable menu */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: collapsed ? "12px 8px" : "12px 14px",
                    transition: "padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Section: MENU */}
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: t.sectionLabel,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        padding: collapsed ? "12px 0 6px" : "12px 10px 6px",
                        margin: 0,
                        textAlign: collapsed ? "center" : "left",
                        opacity: collapsed ? 0 : 1,
                        maxHeight: collapsed ? 0 : 36,
                        overflow: "hidden",
                        transition: "opacity 0.25s ease, max-height 0.35s ease",
                    }}
                >
                    MENU
                </p>

                {menuItems.map((item) => {
                    const hasChildren = !!item.children
                    const isOpen = openMenus[item.id]
                    const isActive = isItemActive(item)

                    return (
                        <div
                            key={item.id}
                            ref={(el) => {
                                if (hasChildren) itemRefs.current[item.id] = el
                            }}
                            onMouseEnter={() => hasChildren && handleMouseEnter(item.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleMenu(item.id)
                                    } else if (item.path) {
                                        navigateTo(item.path)
                                    }
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: collapsed ? "column" : "row",
                                    alignItems: "center",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    gap: collapsed ? 2 : 12,
                                    padding: collapsed ? "12px 0" : "10px 12px",
                                    border: "none",
                                    background: isActive ? t.activeBg : hasChildren && isOpen && !collapsed ? t.hoverBg : "transparent",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    color: isActive ? t.activeText : t.itemText,
                                    fontSize: collapsed ? 10 : 14,
                                    fontWeight: isActive ? 600 : 500,
                                    transition: "background 0.2s ease, color 0.2s ease",
                                    position: "relative",
                                    minHeight: collapsed ? "auto" : 42,
                                    marginBottom: 2,
                                }}
                                onMouseOver={(e) => {
                                    if (!isActive) e.currentTarget.style.background = t.hoverBg
                                }}
                                onMouseOut={(e) => {
                                    if (!isActive)
                                        e.currentTarget.style.background =
                                            hasChildren && isOpen && !collapsed ? t.hoverBg : "transparent"
                                }}
                            >
                                <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <span
                                    style={{
                                        flex: collapsed ? undefined : 1,
                                        textAlign: collapsed ? "center" : "left",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {item.label}
                                </span>
                                {hasChildren && !collapsed && (
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            color: t.itemText,
                                            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                                            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </button>

                            {hasChildren && !collapsed && (
                                <AnimatedCollapse isOpen={!!isOpen}>
                                    {item.children!.map((child, i) => (
                                        <ChildItem
                                            key={child.id}
                                            child={child.label}
                                            iconSrc={child.iconSrc}
                                            index={i}
                                            isOpen={!!isOpen}
                                            isLast={i === item.children!.length - 1}
                                            active={isChildActive(child)}
                                            onClick={() => navigateTo(child.path)}
                                            t={t}
                                        />
                                    ))}
                                </AnimatedCollapse>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Bottom section */}
            <div style={{ padding: collapsed ? "12px 8px 16px" : "12px 14px 16px" }}>
                <div style={{ height: 1, background: t.divider, marginBottom: 12 }} />

                {collapsed ? (
                    <div ref={profileRef} style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                        <img
                            src="/Icon.png"
                            alt="user"
                            style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => {
                                if (profileRef.current) {
                                    const rect = profileRef.current.getBoundingClientRect()
                                    setProfilePopoverPos({ top: rect.top - 160, left: rect.right + 10 })
                                }
                                setShowProfilePopover(!showProfilePopover)
                            }}
                        />
                    </div>
                ) : (
                    /* Expanded: compact card */
                    (() => {
                        const cardTextPrimary = isDark ? "#fff" : pc.light
                        const cardTextSecondary = isDark ? "rgba(255,255,255,0.55)" : `rgba(${pcRgb},0.6)`
                        const cardBtnBg = isDark ? "rgba(255,255,255,0.12)" : `rgba(${pcRgb},0.1)`
                        const cardBtnBgHover = isDark ? "rgba(255,255,255,0.2)" : `rgba(${pcRgb},0.18)`
                        const cardBtnText = isDark ? "#fff" : pc.primary
                        return (
                            <div
                                style={{
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    background: isDark
                                        ? `linear-gradient(135deg, rgba(${pcRgb},0.28) 0%, rgba(${pcRgb},0.18) 40%, rgba(${pcRgb},0.1) 100%)`
                                        : `linear-gradient(135deg, ${pc.pastel} 0%, rgba(${pcRgb},0.08) 100%)`,
                                    padding: 16,
                                    border: isDark ? "none" : `1px solid rgba(${pcRgb},0.12)`,
                                    position: "relative" as const,
                                }}
                            >
                                {/* Shine overlay */}
                                <div style={{
                                    position: "absolute", inset: 0, pointerEvents: "none",
                                    background: isDark
                                        ? "radial-gradient(ellipse 120% 80% at 85% 10%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)"
                                        : `radial-gradient(ellipse 120% 80% at 85% 10%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)`,
                                    borderRadius: 16,
                                }} />
                                {/* User row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
                                    <img
                                        src="/Icon.png"
                                        alt="user"
                                        style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                                    />
                                    <div style={{ overflow: "hidden", flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: cardTextPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {session?.user?.name || "Shop Intel"}
                                            </p>
                                            <RoleBadge accent={t.accent} accentLighter={t.accentLighter} />
                                        </div>
                                        <p style={{ fontSize: 11, color: cardTextSecondary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {session?.user_entity?.email || "admin@shopintel.com"}
                                        </p>
                                    </div>
                                </div>

                                {/* Layout button */}
                                <button
                                    onClick={() => setLayoutDrawerOpen(true)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 0",
                                        borderRadius: 10,
                                        background: cardBtnBg,
                                        border: "none",
                                        color: cardBtnText,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        marginBottom: 8,
                                        transition: "background 0.2s ease",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = cardBtnBgHover)}
                                    onMouseOut={(e) => (e.currentTarget.style.background = cardBtnBg)}
                                >
                                    <Layout size={15} />
                                    Layout
                                </button>

                                {/* Theme toggle */}
                                <div
                                    onClick={() => setTheme(isDark ? "light" : "dark")}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        borderRadius: 10,
                                        background: cardBtnBg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                        cursor: "pointer",
                                        transition: "background 0.2s ease",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = cardBtnBgHover)}
                                    onMouseOut={(e) => (e.currentTarget.style.background = cardBtnBg)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {isDark ? <Moon size={15} color={cardBtnText} /> : <Sun size={15} color={cardBtnText} />}
                                        <span style={{ color: cardBtnText, fontSize: 13, fontWeight: 600 }}>
                                            {isDark ? "Dark Mode" : "Light Mode"}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            width: 38,
                                            height: 20,
                                            borderRadius: 10,
                                            background: isDark ? pc.primary : `rgba(${pcRgb},0.3)`,
                                            position: "relative",
                                            transition: "background 0.3s ease",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: "50%",
                                                background: "#fff",
                                                position: "absolute",
                                                top: 2,
                                                left: isDark ? 20 : 2,
                                                transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Sign Out button */}
                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 0",
                                        borderRadius: 10,
                                        background: isDark ? pc.gradient : pc.primary,
                                        border: "none",
                                        color: "#fff",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        transition: "opacity 0.2s ease",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        )
                    })()
                )}
            </div>
        </div>
    )

    const mobilePopoverItem = menuItems.find((i) => i.id === mobileActiveMenu && i.children)

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex"
                style={{
                    width: sidebarWidth,
                    minHeight: "100vh",
                    height: "100vh",
                    background: t.sidebarBg,
                    borderRight: `1px solid ${t.sidebarBorder}`,
                    flexDirection: "column",
                    transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "sticky" as const,
                    top: 0,
                }}
            >
                {sidebarContent}
            </aside>

            {/* Desktop collapsed popover */}
            {collapsed && popoverItem && (
                <div
                    style={{
                        position: "fixed",
                        top: popoverPos.top,
                        left: popoverPos.left,
                        background: isDark
                            ? `radial-gradient(ellipse 100% 80% at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 55%), radial-gradient(ellipse 80% 100% at 0% 100%, rgba(${pcRgb}, 0.25) 0%, transparent 55%), linear-gradient(135deg, rgba(26, 34, 44, 1), rgba(35, 45, 56, 1))`
                            : t.popoverBg,
                        borderRadius: 12,
                        boxShadow: popoverOpen
                            ? isDark
                                ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
                                : t.popoverShadow
                            : "none",
                        padding: "8px 0",
                        minWidth: 180,
                        zIndex: 1000,
                        transformOrigin: "left top",
                        opacity: popoverOpen ? 1 : 0,
                        transform: popoverOpen ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.96)",
                        transition: "opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s ease",
                        pointerEvents: popoverOpen ? "auto" : "none",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${t.sidebarBorder}`,
                    }}
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handlePopoverLeave}
                >
                    {popoverItem.children!.map((child) => (
                        <PopoverChild
                            key={child.id}
                            child={child.label}
                            iconSrc={child.iconSrc}
                            active={isChildActive(child)}
                            onClick={() => navigateTo(child.path)}
                            t={t}
                        />
                    ))}
                </div>
            )}

            {/* ─── Mobile bottom navigation ─── */}
            {/* Backdrop when submenu or profile is open */}
            {(mobileActiveMenu || mobileProfileOpen) && (
                <div
                    className="lg:hidden fixed inset-0 z-[998]"
                    style={{ background: "transparent" }}
                    onClick={() => { setMobileActiveMenu(null); setMobileProfileOpen(false) }}
                />
            )}

            {/* Mobile submenu popover (slides up above the bar) */}
            <div
                className="lg:hidden fixed left-0 right-0 z-[999]"
                style={{
                    bottom: 68,
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    pointerEvents: mobilePopoverItem ? "auto" : "none",
                }}
            >
                <div
                    style={{
                        margin: "0 12px",
                        background: t.popoverBg,
                        borderRadius: 16,
                        boxShadow: mobilePopoverItem ? t.popoverShadow : "none",
                        border: mobilePopoverItem ? `1px solid ${t.sidebarBorder}` : "none",
                        padding: mobilePopoverItem ? "10px 6px" : 0,
                        opacity: mobilePopoverItem ? 1 : 0,
                        transform: mobilePopoverItem ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
                        transformOrigin: "bottom center",
                        transition: "opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                        maxHeight: "60vh",
                        overflowY: "auto",
                    }}
                >
                    {mobilePopoverItem && (
                        <>
                            <p style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: t.sectionLabel,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                padding: "4px 14px 8px",
                                margin: 0,
                            }}>
                                {mobilePopoverItem.label}
                            </p>
                            {mobilePopoverItem.children!.map((child) => {
                                const active = isChildActive(child)
                                return (
                                    <button
                                        key={child.id}
                                        onClick={() => navigateTo(child.path)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "11px 14px",
                                            border: "none",
                                            background: active ? t.activeBg : "transparent",
                                            color: active ? t.activeText : t.itemText,
                                            fontSize: 14,
                                            fontWeight: active ? 600 : 500,
                                            borderRadius: 10,
                                            cursor: "pointer",
                                            transition: "background 0.15s ease, color 0.15s ease",
                                        }}
                                    >
                                        {child.iconSrc && (
                                            <img src={child.iconSrc} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: "contain", flexShrink: 0 }} />
                                        )}
                                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.label}</span>
                                    </button>
                                )
                            })}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile profile popover (slides up above the bar) */}
            <div
                className="lg:hidden fixed left-0 right-0 z-[999]"
                style={{
                    bottom: 68,
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    pointerEvents: mobileProfileOpen ? "auto" : "none",
                }}
            >
                <div
                    style={{
                        margin: "0 12px",
                        background: t.popoverBg,
                        borderRadius: 16,
                        boxShadow: mobileProfileOpen ? t.popoverShadow : "none",
                        border: mobileProfileOpen ? `1px solid ${t.sidebarBorder}` : "none",
                        padding: mobileProfileOpen ? "10px 6px" : 0,
                        opacity: mobileProfileOpen ? 1 : 0,
                        transform: mobileProfileOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
                        transformOrigin: "bottom center",
                        transition: "opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                        maxHeight: "60vh",
                        overflowY: "auto",
                    }}
                >
                    {mobileProfileOpen && (
                        <>
                            <div style={{ padding: "4px 10px 10px", borderBottom: `1px solid ${t.divider}`, marginBottom: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: t.userText, margin: 0 }}>
                                        {session?.user?.name || "Shop Intel"}
                                    </p>
                                    <RoleBadge accent={t.accent} accentLighter={t.accentLighter} />
                                </div>
                                <p style={{ fontSize: 11, color: t.userSub, margin: "2px 0 0" }}>
                                    {session?.user_entity?.email || "admin@shopintel.com"}
                                </p>
                            </div>
                            <button
                                onClick={() => { setMobileProfileOpen(false); setLayoutDrawerOpen(true) }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px",
                                    border: "none", background: "transparent", color: t.itemText, fontSize: 14, fontWeight: 500,
                                    borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "background 0.15s ease",
                                }}
                            >
                                <Layout size={18} /> Layout
                            </button>
                            <div
                                onClick={() => setTheme(isDark ? "light" : "dark")}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                                    padding: "11px 14px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s ease",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, color: t.itemText, fontSize: 14, fontWeight: 500 }}>
                                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                                    {isDark ? "Light Mode" : "Dark Mode"}
                                </div>
                                <div style={{ width: 38, height: 20, borderRadius: 10, background: isDark ? pc.primary : "rgba(0,0,0,0.15)", position: "relative", transition: "background 0.3s ease", flexShrink: 0 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: isDark ? 20 : 2, transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                </div>
                            </div>
                            <button
                                onClick={() => { setMobileProfileOpen(false); setShowLogoutDialog(true) }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px",
                                    border: "none", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 500,
                                    borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "background 0.15s ease",
                                }}
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile bottom bar */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000]"
                style={{
                    background: t.sidebarBg,
                    borderTop: `1px solid ${t.sidebarBorder}`,
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        padding: "6px 4px 8px",
                        gap: 2,
                    }}
                >
                    {menuItems.map((item) => {
                        const isActive = isItemActive(item)
                        const isMobileMenuOpen = mobileActiveMenu === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setMobileProfileOpen(false)
                                    if (item.children) {
                                        setMobileActiveMenu(isMobileMenuOpen ? null : item.id)
                                    } else if (item.path) {
                                        navigateTo(item.path)
                                    }
                                }}
                                style={{
                                    flex: "1 0 0",
                                    minWidth: 56,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 3,
                                    padding: "6px 4px 2px",
                                    border: "none",
                                    background: isMobileMenuOpen ? t.activeBg : "transparent",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    color: isActive || isMobileMenuOpen ? t.activeText : t.itemText,
                                    transition: "color 0.2s ease, background 0.2s ease",
                                    position: "relative",
                                }}
                            >
                                <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {item.icon}
                                </div>
                                <span style={{
                                    fontSize: 9,
                                    fontWeight: isActive ? 700 : 500,
                                    lineHeight: 1.1,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                }}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div style={{
                                        position: "absolute",
                                        top: 2,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: 16,
                                        height: 2.5,
                                        borderRadius: 2,
                                        background: t.activeText,
                                    }} />
                                )}
                            </button>
                        )
                    })}
                    {/* Profile button */}
                    <button
                        onClick={() => { setMobileActiveMenu(null); setMobileProfileOpen(!mobileProfileOpen) }}
                        style={{
                            flex: "1 0 0",
                            minWidth: 56,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                            padding: "6px 4px 2px",
                            border: "none",
                            background: mobileProfileOpen ? t.activeBg : "transparent",
                            borderRadius: 10,
                            cursor: "pointer",
                            color: mobileProfileOpen ? t.activeText : t.itemText,
                            transition: "color 0.2s ease, background 0.2s ease",
                            position: "relative",
                        }}
                    >
                        <img
                            src="/Icon.png"
                            alt="profile"
                            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                        />
                        <span style={{ fontSize: 9, fontWeight: 500, lineHeight: 1.1, whiteSpace: "nowrap" }}>
                            Profile
                        </span>
                    </button>
                </div>
            </nav>

            {/* Collapsed profile popover */}
            {collapsed && (
                <>
                    {showProfilePopover && (
                        <div
                            style={{ position: "fixed", inset: 0, zIndex: 999 }}
                            onClick={() => setShowProfilePopover(false)}
                        />
                    )}
                    <div
                        style={{
                            position: "fixed",
                            top: profilePopoverPos.top,
                            left: profilePopoverPos.left,
                            background: isDark
                                ? `radial-gradient(ellipse 100% 80% at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 55%), radial-gradient(ellipse 80% 100% at 0% 100%, rgba(${pcRgb}, 0.25) 0%, transparent 55%), linear-gradient(135deg, rgba(26, 34, 44, 1), rgba(35, 45, 56, 1))`
                                : t.popoverBg,
                            borderRadius: 12,
                            boxShadow: showProfilePopover
                                ? isDark
                                    ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
                                    : t.popoverShadow
                                : "none",
                            padding: "8px 0",
                            minWidth: 190,
                            zIndex: 1000,
                            transformOrigin: "left bottom",
                            opacity: showProfilePopover ? 1 : 0,
                            transform: showProfilePopover ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.96)",
                            transition: "opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s ease",
                            pointerEvents: showProfilePopover ? "auto" : "none",
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${t.sidebarBorder}`,
                        }}
                    >
                        {/* User info row */}
                        <div style={{ padding: "6px 14px 10px", borderBottom: `1px solid ${t.divider}`, marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: t.userText, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {session?.user?.name || "Shop Intel"}
                                </p>
                                <RoleBadge accent={t.accent} accentLighter={t.accentLighter} />
                            </div>
                            <p style={{ fontSize: 11, color: t.userSub, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {session?.user_entity?.email || "admin@shopintel.com"}
                            </p>
                        </div>

                        {[
                            { icon: <Layout size={16} />, label: "Layout", onClick: () => { setShowProfilePopover(false); setLayoutDrawerOpen(true) } },
                            { icon: isDark ? <Sun size={16} /> : <Moon size={16} />, label: isDark ? "Light Mode" : "Dark Mode", onClick: () => setTheme(isDark ? "light" : "dark"), trailing: (
                                <div style={{ width: 34, height: 18, borderRadius: 9, background: isDark ? pc.primary : "rgba(0,0,0,0.15)", position: "relative", transition: "background 0.3s ease", flexShrink: 0 }}>
                                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: isDark ? 18 : 2, transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                </div>
                            )},
                            { icon: <LogOut size={16} />, label: "Sign Out", onClick: () => { setShowProfilePopover(false); setShowLogoutDialog(true) } },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    width: "calc(100% - 12px)",
                                    margin: "0 6px",
                                    padding: "9px 10px",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: t.itemText,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    fontFamily: "inherit",
                                    textAlign: "left",
                                    borderRadius: 8,
                                    transition: "color 0.15s ease, background 0.15s ease",
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = t.hoverBg; e.currentTarget.style.color = t.hoverText }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.itemText }}
                            >
                                {item.icon}
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.trailing}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Logout confirmation dialog */}
            {showLogoutDialog && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setShowLogoutDialog(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: isDark ? "#131820" : "#fff",
                            borderRadius: 20,
                            padding: "28px 24px 20px",
                            width: "90%",
                            maxWidth: 360,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            border: `1px solid ${isDark ? `rgba(${pcRgb},0.15)` : "rgba(0,0,0,0.08)"}`,
                            textAlign: "center",
                        }}
                    >
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 16px",
                        }}>
                            <LogOut size={22} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#e5e7eb" : "#1a1025", margin: "0 0 8px" }}>
                            Sign Out
                        </h3>
                        <p style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280", margin: "0 0 24px", lineHeight: 1.5 }}>
                            Are you sure you want to sign out? You&apos;ll need to log in again to access your dashboard.
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => setShowLogoutDialog(false)}
                                style={{
                                    flex: 1, padding: "10px 0", borderRadius: 12,
                                    background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                                    border: "none", color: isDark ? "#d1d5db" : "#374151",
                                    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb")}
                                onMouseOut={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6")}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setShowLogoutDialog(false); logout() }}
                                style={{
                                    flex: 1, padding: "10px 0", borderRadius: 12,
                                    background: "linear-gradient(90deg, #ef4444, #dc2626)",
                                    border: "none", color: "#fff",
                                    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                    transition: "opacity 0.2s ease",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout drawer */}
            <LayoutDrawer open={layoutDrawerOpen} onClose={() => setLayoutDrawerOpen(false)} />

            {/* Scrollbar styling */}
            <style>{`
                aside::-webkit-scrollbar { width: 4px; }
                aside::-webkit-scrollbar-track { background: transparent; }
                aside::-webkit-scrollbar-thumb { background: rgba(${pcRgb},0.15); border-radius: 4px; }
                aside::-webkit-scrollbar-thumb:hover { background: rgba(${pcRgb},0.3); }
                nav::-webkit-scrollbar { display: none; }
            `}</style>
        </>
    )
}
