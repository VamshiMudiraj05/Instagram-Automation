"use client"

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Bot,
  Film,
  FolderPlus,
  Globe,
  Grid2X2,
  Inbox,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { QuickAutomationForm } from "@/components/dashboard/QuickAutomationForm"
import { AssistantSettings } from "@/components/dashboard/AssistantSettings"
import { CreateRuleForm } from "@/components/dashboard/CreateRuleForm"
import { cn } from "@/lib/utils"
import type { Automation } from "@/lib/types"

function AutomationsContent() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get("id")
  const [rules, setRules] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [edit, setEdit] = useState<Automation | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showCreate, setShowCreate] = useState(searchParams.get("new") === "true")

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/automations?userId=${userId}`)
      const data = await response.json()
      if (!response.ok || !Array.isArray(data)) throw new Error()
      setRules(data)
      setError("")
    } catch {
      setError("Could not load automations. Please retry.")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Scroll to selected automation if specified in query params
  useEffect(() => {
    if (selectedId && rules.length > 0) {
      const el = document.getElementById(`automation-${selectedId}`)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 150)
      }
    }
  }, [selectedId, rules])

  async function update(rule: Automation, remove = false) {
    if (busy) return
    setBusy(rule.id)
    try {
      const response = await fetch(remove ? `/api/automations?id=${rule.id}` : "/api/automations", {
        method: remove ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(remove ? {} : { body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }) }),
      })
      if (!response.ok) throw new Error()
      setRules((current) =>
        remove
          ? current.filter((item) => item.id !== rule.id)
          : current.map((item) => (item.id === rule.id ? { ...item, is_active: !item.is_active } : item))
      )
      setDeleting(null)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("automation-changed"))
      }
    } catch {
      setError("Could not save that change. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  if (sessionLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )

  if (!userId)
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Connect your Instagram account to view and manage automations.
      </div>
    )

  const filtered = rules.filter((rule) => {
    const text = `${rule.name || ""} ${rule.trigger_value || ""} ${
      rule.response_content?.message || ""
    } ${rule.specific_media_id || ""}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Top Banner */}
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border bg-card/60 px-5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            ✦
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            Turn comments and DMs into automatic link delivery and engagement.
          </span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
        >
          <Plus className="size-3.5" />
          Create automation
        </button>
      </div>

      {/* Page Header */}
      <div className="border-b border-border bg-card/30 px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Automations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor, customize and identify all your Instagram auto-reply workflows.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all shrink-0"
          >
            <Plus className="size-4" /> New Automation
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8 sm:px-10">
        {/* Left Subnav */}
        <aside className="hidden w-48 shrink-0 space-y-1.5 md:block">
          <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Views
          </div>
          <button className="flex w-full items-center justify-between rounded-lg bg-accent px-3 py-2 text-left text-sm font-medium text-foreground">
            <span className="flex items-center gap-2">
              <Bot className="size-4" /> All Workflows
            </span>
            <span className="text-xs text-muted-foreground font-semibold">{rules.length}</span>
          </button>
          <button
            onClick={() => setQuery("comment")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <Film className="size-4" /> Reel Comments
          </button>
          <button
            onClick={() => setQuery("dm")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <Inbox className="size-4" /> Direct Messages
          </button>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0 flex-1">
          {edit ? (
            <section>
              <button
                className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
                onClick={() => setEdit(null)}
              >
                <ArrowLeft className="size-4" />
                Back to automations
              </button>
              <CreateRuleForm
                key={edit.id}
                userId={userId}
                triggerSource={edit.trigger_source}
                editRule={edit}
                onSuccess={() => {
                  setEdit(null)
                  void refresh()
                }}
              />
            </section>
          ) : (
            <>
              {/* Inline Create Form Modal/Card */}
              {showCreate && (
                <div className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm animate-in fade-in-50 duration-200">
                  <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-base font-semibold">New Automation</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Configure comment or DM triggers, follow-gate, and instant automated replies.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreate(false)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <QuickAutomationForm
                    userId={userId}
                    initialSource="comment"
                    onSuccess={() => {
                      setSaved(true)
                      setShowCreate(false)
                      void refresh()
                    }}
                  />
                </div>
              )}

              {saved && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>✓ Automation saved and currently live on Instagram.</span>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <label className="flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm shadow-2xs">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    aria-label="Search automations"
                    placeholder="Search by name, keyword, or reel..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear
                    </button>
                  )}
                </label>
              </div>

              {/* Automations Listing */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span>Workflows</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {rules.length}
                    </span>
                  </h2>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {rules.filter((rule) => rule.is_active).length} active
                  </span>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                  >
                    <span>{error}</span>
                    <button onClick={() => void refresh()} className="font-semibold underline">
                      Retry
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Loading your automations...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/30">
                    <p className="text-sm font-medium text-foreground">
                      {query ? "No automations match your search." : "No automations created yet."}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {query ? "Try clearing your search query." : "Click 'New Automation' above to create your first auto-reply."}
                    </p>
                    {!query && (
                      <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                      >
                        <Plus className="size-3.5" />
                        Create first automation
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((rule) => {
                      const isAny = rule.trigger_value === "*" || rule.trigger_type === "reply_all"
                      const isFollowGate = Boolean(rule.response_content?.check_follow)
                      const isSpecific = Boolean(rule.specific_media_id)
                      const hasPublicReply = Boolean(
                        rule.response_content?.reply_mode === "both" ||
                          (rule.response_content as any)?.reply_comment ||
                          (rule.response_content as any)?.comment_reply_text
                      )
                      const publicText =
                        (rule.response_content as any)?.comment_reply_text ||
                        rule.response_content?.public_replies?.[0]
                      const isTargeted = selectedId === rule.id

                      return (
                        <div
                          key={rule.id}
                          id={`automation-${rule.id}`}
                          className={cn(
                            "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200",
                            isTargeted
                              ? "ring-2 ring-primary ring-offset-2 border-primary/60 bg-primary/[0.03]"
                              : "hover:border-border/80 hover:shadow-sm"
                          )}
                        >
                          {/* Top Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                  rule.is_active
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {rule.trigger_source === "comment" ? (
                                  <Film className="size-5" />
                                ) : (
                                  <MessageSquare className="size-5" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-semibold text-foreground truncate">
                                    {rule.name || (isAny ? "Reply to any comment" : `Reply to ${rule.trigger_value}`)}
                                  </h3>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                                      rule.is_active
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "size-1.5 rounded-full",
                                        rule.is_active ? "bg-emerald-500" : "bg-muted-foreground"
                                      )}
                                    />
                                    {rule.is_active ? "Active" : "Paused"}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Created {new Date(rule.created_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {deleting === rule.id ? (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">Delete this workflow?</span>
                                  <button
                                    disabled={!!busy}
                                    onClick={() => void update(rule, true)}
                                    className="rounded-lg bg-destructive px-3 py-1.5 font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleting(null)}
                                    className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-accent transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    disabled={!!busy}
                                    onClick={() => void update(rule)}
                                    aria-label={`${rule.is_active ? "Pause" : "Activate"} ${rule.name}`}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs",
                                      rule.is_active
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {busy === rule.id ? <Loader2 className="size-3 animate-spin" /> : null}
                                    {rule.is_active ? "Pause" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => setEdit(rule)}
                                    aria-label={`Edit ${rule.name}`}
                                    className="inline-flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleting(rule.id)}
                                    aria-label={`Delete ${rule.name}`}
                                    className="inline-flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Identification & Condition Badges */}
                          <div className="mt-3.5 flex flex-wrap items-center gap-2">
                            {/* Trigger Mode */}
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs">
                              <span className="text-muted-foreground">Trigger:</span>
                              <span className="font-semibold text-foreground">
                                {isAny ? "💬 Any Comment" : `🔑 "${rule.trigger_value}"`}
                              </span>
                            </div>

                            {/* Target Reel */}
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs">
                              <span className="text-muted-foreground">Target:</span>
                              {isSpecific ? (
                                <span className="font-semibold text-primary flex items-center gap-1">
                                  <Film className="size-3" /> Specific Reel ({rule.specific_media_id})
                                </span>
                              ) : (
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                  <Globe className="size-3" /> All Reels & Posts
                                </span>
                              )}
                            </div>

                            {/* Follow-Gate */}
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs">
                              <span className="text-muted-foreground">Condition:</span>
                              {isFollowGate ? (
                                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Lock className="size-3" /> Follow-Gate (Must follow @vamshi__verse)
                                </span>
                              ) : (
                                <span className="font-semibold text-foreground">
                                  🔓 Open to all commenters
                                </span>
                              )}
                            </div>

                            {/* Button Card Badge */}
                            {rule.response_content?.card && (
                              <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs text-primary font-semibold">
                                <span>🔘 Tap Button: {rule.response_content.card.buttons?.[0]?.title || "Open Link"}</span>
                              </div>
                            )}
                          </div>

                          {/* Reply Previews Grid */}
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {/* Private DM Preview */}
                            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                                <span className="text-primary">📥 Private DM Reply</span>
                                {rule.response_content?.card && (
                                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    Button Card
                                  </span>
                                )}
                              </div>
                              {rule.response_content?.card ? (
                                <div className="mt-2 space-y-1.5">
                                  <p className="text-xs font-semibold text-foreground">
                                    {rule.response_content.card.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {rule.response_content.card.subtitle || rule.response_content.message}
                                  </p>
                                  {rule.response_content.card.buttons?.[0] && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                                      <span>{rule.response_content.card.buttons[0].title}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                                  {rule.response_content?.message || "(No message content set)"}
                                </p>
                              )}
                            </div>

                            {/* Public Comment Reply */}
                            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <span>💬 Public Comment Reply</span>
                              </div>
                              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed italic line-clamp-3">
                                {hasPublicReply && publicText ? `"${publicText}"` : "None (DM reply only)"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <AssistantSettings userId={userId} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default function AutomationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AutomationsContent />
    </Suspense>
  )
}
