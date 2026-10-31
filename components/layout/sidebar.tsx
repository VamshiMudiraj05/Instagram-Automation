"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Film,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Automation } from "@/lib/types"

const NAV = [
  { href: "/dashboard", label: "Home", icon: "/icons/home.svg" },
  { href: "/dashboard/automations", label: "Your Automations", icon: "/icons/journal.svg" },
  { href: "/dashboard/inbox", label: "Conversations", icon: "/icons/chat.svg" },
  { href: "/dashboard/ice-breakers", label: "Conversation starters", icon: "/icons/squads.svg" },
  { href: "/dashboard/analytics", label: "Insights", icon: "/icons/analytics.svg" },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  username?: string
  userId?: string
  profilePic?: string | null
  onLogout?: () => void
  onNavigate?: () => void
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({
  className,
  username = "creator",
  userId,
  profilePic,
  onLogout,
  onNavigate,
  collapsed = false,
  onToggle,
  ...props
}: SidebarProps) {
  const pathname = usePathname()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loadingAutomations, setLoadingAutomations] = useState(false)
  const [automationsOpen, setAutomationsOpen] = useState(true)

  const fetchAutomations = useCallback(async () => {
    if (!userId) return
    try {
      setLoadingAutomations(true)
      const res = await fetch(`/api/automations?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setAutomations(data)
        }
      }
    } catch (err) {
      console.error("Failed to load automations in sidebar", err)
    } finally {
      setLoadingAutomations(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  useEffect(() => {
    const handleUpdate = () => fetchAutomations()
    window.addEventListener("automation-changed", handleUpdate)
    return () => window.removeEventListener("automation-changed", handleUpdate)
  }, [fetchAutomations])

  const itemClass = (active: boolean) =>
    cn(
      "relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      collapsed ? "justify-center px-0" : "gap-3 px-3",
      active
        ? "bg-sidebar-accent text-sidebar-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
    )

  const activeAutomationsCount = automations.filter((a) => a.is_active).length

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none",
        className
      )}
      {...props}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center" : "px-4"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="InstaAuto home"
          className={cn("flex items-center gap-2.5 rounded-lg", !collapsed && "px-1")}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
            <Zap className="size-4" />
          </span>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight leading-none">InstaAuto</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Automations Studio</span>
            </div>
          )}
        </Link>
        {!collapsed && onToggle && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

      {collapsed && onToggle && (
        <div className="px-3 pt-3 shrink-0">
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="flex size-10 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Main Navigation (Scrollable) */}
      <nav
        className="flex-1 space-y-1.5 px-3 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin"
        aria-label="Dashboard navigation"
      >
        {NAV.map((item) => {
          const isAutomations = item.href === "/dashboard/automations"
          const active = isAutomations
            ? pathname.startsWith("/dashboard/automations")
            : pathname === item.href

          return (
            <div key={item.href} className="space-y-1">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(itemClass(active), "flex-1")}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className={cn(
                      "size-4 shrink-0 dark:invert",
                      active && item.href === "/dashboard" && "dark:invert-0"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {isAutomations && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                            activeAutomationsCount > 0
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {automations.length}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Dropdown toggle for Your Automations when expanded */}
                {!collapsed && isAutomations && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setAutomationsOpen((prev) => !prev)
                    }}
                    title={automationsOpen ? "Collapse automations list" : "Expand automations list"}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-transform"
                  >
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        !automationsOpen && "-rotate-90"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Sub-list of Existing Automations */}
              {!collapsed && isAutomations && automationsOpen && (
                <div className="ml-2 pl-3 border-l border-sidebar-border/80 my-1.5 space-y-1.5">
                  <div className="flex items-center justify-between px-1 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <span>Active Workflows</span>
                    <Link
                      href="/dashboard/automations?new=true"
                      onClick={onNavigate}
                      title="Create New Automation"
                      className="flex items-center gap-1 text-[10px] lowercase font-medium text-primary hover:underline"
                    >
                      <Plus className="size-3" /> new
                    </Link>
                  </div>

                  {loadingAutomations ? (
                    <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : automations.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-sidebar-border p-2.5 text-center text-xs text-muted-foreground">
                      <p>No automations yet</p>
                      <Link
                        href="/dashboard/automations?new=true"
                        onClick={onNavigate}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <Plus className="size-3" /> Create first
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                      {automations.map((rule) => {
                        const isAny =
                          rule.trigger_value === "*" || rule.trigger_type === "reply_all"
                        const isFollowGate = Boolean(rule.response_content?.check_follow)
                        const isSpecific = Boolean(rule.specific_media_id)

                        return (
                          <Link
                            key={rule.id}
                            href={`/dashboard/automations?id=${rule.id}`}
                            onClick={onNavigate}
                            className={cn(
                              "group flex flex-col gap-1 rounded-lg border border-transparent p-2 text-xs transition-all hover:border-sidebar-border hover:bg-sidebar-accent/60"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="flex items-center gap-1.5 font-medium truncate">
                                <span
                                  className={cn(
                                    "size-2 shrink-0 rounded-full",
                                    rule.is_active
                                      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                                      : "bg-muted-foreground/40"
                                  )}
                                />
                                <span className="truncate text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {rule.name || (isAny ? "Reply to any comment" : rule.trigger_value)}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded",
                                  rule.is_active
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {rule.is_active ? "On" : "Off"}
                              </span>
                            </div>

                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-1 pl-3.5 text-[10px]">
                              <span className="rounded bg-muted/70 px-1.5 py-0.5 text-muted-foreground font-medium">
                                {isAny ? "💬 Any comment" : `🔑 "${rule.trigger_value}"`}
                              </span>
                              {isSpecific ? (
                                <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 font-medium flex items-center gap-0.5">
                                  <Film className="size-2.5" /> Reel
                                </span>
                              ) : (
                                <span className="rounded bg-muted/70 text-muted-foreground px-1.5 py-0.5 font-medium flex items-center gap-0.5">
                                  <Globe className="size-2.5" /> All
                                </span>
                              )}
                              {isFollowGate && (
                                <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 font-medium flex items-center gap-0.5">
                                  <Lock className="size-2.5" /> Follow
                                </span>
                              )}
                            </div>

                            {/* DM Preview snippet */}
                            {rule.response_content?.message && (
                              <p className="line-clamp-1 pl-3.5 text-[11px] text-muted-foreground/80 italic">
                                "{rule.response_content.message}"
                              </p>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="my-3 h-px bg-sidebar-border" />

        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          aria-current={pathname === "/dashboard/settings" ? "page" : undefined}
          aria-label={collapsed ? "Preferences" : undefined}
          title={collapsed ? "Preferences" : undefined}
          className={itemClass(pathname === "/dashboard/settings")}
        >
          <img src="/icons/profile.svg" alt="" className="size-4 shrink-0 dark:invert" />
          {!collapsed && <span>Preferences</span>}
        </Link>
      </nav>

      {/* Footer Profile & Appearance */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {!collapsed && (
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">Appearance</span>
            <ThemeToggle className="h-7 w-14" />
          </div>
        )}
        <div
          className={cn(
            "flex items-center rounded-lg bg-sidebar-accent p-2",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground shadow-xs">
            {profilePic ? (
              <img src={profilePic} alt={username} className="size-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">@{username}</p>
                <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Instagram connected
                </p>
              </div>
              <button
                onClick={onLogout}
                aria-label="Log out"
                title="Log out"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar hover:text-destructive transition-all"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
