"use client"

import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Automation } from "@/lib/types"
import { PostSelector, InstagramMediaItem } from "@/components/dashboard/PostSelector"

type Source = Automation["trigger_source"]

export function QuickAutomationForm({ userId, initialSource = "comment", onSuccess }: {
  userId: string
  initialSource?: Source
  onSuccess: (source: Source) => void
}) {
  const [source, setSource] = useState<Source>(initialSource || "comment")
  const [triggerMode, setTriggerMode] = useState<"keyword" | "any">("keyword")
  const [keyword, setKeyword] = useState("")
  const [answer, setAnswer] = useState("")
  const [checkFollow, setCheckFollow] = useState(false)
  const [replyPublicly, setReplyPublicly] = useState(true)
  const [publicReplyText, setPublicReplyText] = useState("Check your DMs! 📥")
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submitting = useRef(false)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !answer.trim()) return
    if (triggerMode === "keyword" && !keyword.trim()) return

    submitting.current = true
    setSaving(true)
    setError("")

    const isAny = triggerMode === "any"
    const finalTriggerValue = isAny ? "*" : keyword.trim().toLowerCase()
    const autoName = isAny
      ? "Reply to any comment" + (selectedMedia ? ` on ${selectedMedia.id}` : "")
      : "Reply to " + keyword.trim()

    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: autoName,
          trigger_source: source,
          trigger_type: isAny ? "reply_all" : (source === "story" ? "reply" : "keyword"),
          trigger_value: finalTriggerValue,
          content: {
            message: answer.trim(),
            reply_mode: source === "comment" && replyPublicly ? "both" : "dm_only",
            check_follow: checkFollow,
            public_replies: replyPublicly && publicReplyText.trim() ? [publicReplyText.trim()] : ["Check your DMs! 📥"],
          },
          specific_media_id: source === "comment" ? selectedMediaId : null,
        }),
      })
      if (!response.ok) throw new Error("Could not save. Please try again.")
      setKeyword("")
      setAnswer("")
      setSelectedMediaId(null)
      setSelectedMedia(null)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("automation-changed"))
      }
      onSuccess(source)
    } catch {
      setError("Could not save. Check your connection and try again.")
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return <form onSubmit={save} className="overflow-hidden rounded-xl border border-border bg-card">
    <fieldset disabled={saving} className="min-w-0">
      <label className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="shrink-0 text-xs text-muted-foreground font-medium">Trigger source</span>
        <select
          value={source}
          onChange={event => {
            const next = event.target.value as Source
            setSource(next)
            if (next !== "comment") {
              setSelectedMediaId(null)
              setSelectedMedia(null)
            }
          }}
          className="rounded-md bg-card py-1 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="comment">Post comments</option>
          <option value="dm">Direct messages</option>
          <option value="story">Story replies</option>
        </select>
      </label>

      {source === "comment" && (
        <div className="border-b border-border bg-muted/20 p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">Choose where this runs</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Apply this reply to every post/reel, or pick one specific post or reel.
            </p>
          </div>
          <PostSelector
            userId={userId}
            selectedMediaId={selectedMediaId}
            onSelect={(id, item) => {
              setSelectedMediaId(id)
              setSelectedMedia(item)
            }}
          />
        </div>
      )}

      {/* Trigger Condition: Specific Word vs Comment Anything */}
      {source === "comment" && (
        <div className="border-b border-border px-4 py-3.5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-foreground">Trigger condition</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Choose whether to require specific words or reply to any comment.
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setTriggerMode("keyword")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                triggerMode === "keyword"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Specific word(s)
            </button>
            <button
              type="button"
              onClick={() => setTriggerMode("any")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                triggerMode === "any"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Comment anything
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-[1fr_2fr]">
        {triggerMode === "keyword" ? (
          <label className="block border-b border-border p-4 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">When they say</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-ui font-medium">Case-insensitive</span>
            </div>
            <input
              required
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="e.g. barbell, price, link"
              className="mt-2 w-full rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
              Separate multiple words with commas. Capitalization does not matter (<span className="font-mono">BARBELL</span>, <span className="font-mono">Barbell</span>, <span className="font-mono">barbell</span>).
            </p>
          </label>
        ) : (
          <div className="border-b border-border p-4 sm:border-b-0 sm:border-r flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-blue bg-accent-blue/10 px-2.5 py-1.5 rounded-lg w-fit">
              <span>✦ Any Comment Trigger</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Any comment left by a viewer on this reel will trigger the reply.
            </p>
          </div>
        )}

        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Send this DM reply</span>
            <textarea
              required
              maxLength={1000}
              rows={3}
              value={answer}
              onChange={event => setAnswer(event.target.value)}
              placeholder="Here is your link: https://drive.google.com/..."
              className="mt-2 w-full resize-y rounded-md border border-border bg-muted/30 p-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          {/* Follower Gate Toggle */}
          <div className="pt-2 border-t border-border flex items-start gap-3">
            <input
              id="check-follow-toggle"
              type="checkbox"
              checked={checkFollow}
              onChange={e => setCheckFollow(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="check-follow-toggle" className="cursor-pointer select-none">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🔒 Only send if they follow you (Follow-Gate)</span>
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                If they don't follow @vamshi__verse, they are prompted to follow to unlock the link.
              </p>
            </label>
          </div>

          {/* Public Reply Option */}
          {source === "comment" && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-3">
                <input
                  id="reply-public-toggle"
                  type="checkbox"
                  checked={replyPublicly}
                  onChange={e => setReplyPublicly(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="reply-public-toggle" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                  💬 Also reply publicly to their comment
                </label>
              </div>
              {replyPublicly && (
                <input
                  type="text"
                  value={publicReplyText}
                  onChange={e => setPublicReplyText(e.target.value)}
                  placeholder="e.g. Check your DMs! 📥"
                  className="w-full text-xs bg-muted/30 border border-border rounded-md px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 bg-muted/10">
        <p className="text-xs text-muted-foreground truncate">
          {source === "comment"
            ? selectedMediaId
              ? "Runs on selected reel · " + (triggerMode === "any" ? "Any comment" : "Keyword match")
              : "Runs on all reels · " + (triggerMode === "any" ? "Any comment" : "Keyword match")
            : "Direct messages"}
        </p>
        <button
          disabled={saving || (triggerMode === "keyword" && !keyword.trim()) || !answer.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-all shrink-0"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save Automation"}
        </button>
      </div>
      {error && <p role="alert" className="px-4 pb-3 text-sm text-destructive">{error}</p>}
    </fieldset>
  </form>
}
