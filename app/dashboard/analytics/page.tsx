"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, ArrowUpRight, BarChart3, Loader2, MessageSquare, Users } from "lucide-react"
import { useInstagramSession } from "@/hooks/use-instagram-session"

interface DashboardStats {
  metrics: { totalAutomations: number; activeTriggers: number; audienceReached: number; messagesSent: number }
  recentActivity: Array<{ id: string; content: string; created_at: string; recipient?: { recipient_username: string } }>
}

export default function AnalyticsPage() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadStats = () => {
      fetch(`/api/dashboard/stats?userId=${userId}`)
        .then(response => response.json())
        .then(data => { if (data && !data.error) setStats(data) })
        .catch(error => console.error("Failed to load analytics stats", error))
        .finally(() => setLoading(false))
    }

    loadStats()
    const interval = setInterval(loadStats, 10000)
    return () => clearInterval(interval)
  }, [userId])

  const metrics = stats?.metrics

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
      <header className="border-b border-border pb-7">
        <p className="text-sm text-muted-foreground">Performance</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">Insights & Metrics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time delivery performance, audience reach, and conversation volume.
        </p>
      </header>

      <div className="grid border-b border-border sm:grid-cols-3">
        <Metric
          label="Messages sent"
          value={metrics ? metrics.messagesSent.toLocaleString() : (loading ? "..." : "0")}
          icon={MessageSquare}
        />
        <Metric
          label="People reached"
          value={metrics ? metrics.audienceReached.toLocaleString() : (loading ? "..." : "0")}
          icon={Users}
        />
        <Metric
          label="Active workflows"
          value={metrics ? metrics.activeTriggers.toLocaleString() : (loading ? "..." : "0")}
          icon={Activity}
        />
      </div>

      <section className="mt-7 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Recent conversation activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Real-time audit log of replies delivered to commenters and DM users
            </p>
          </div>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Live
          </span>
        </div>

        {stats?.recentActivity?.length ? (
          <div className="divide-y divide-border">
            {stats.recentActivity.map((msg) => (
              <div key={msg.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <MessageSquare className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      @{msg.recipient?.recipient_username || "instagram_user"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-xl">
                      {msg.content}
                    </p>
                  </div>
                </div>
                <time className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary">
              <BarChart3 className="size-5 text-muted-foreground" />
            </span>
            <h3 className="mt-4 text-sm font-medium">No activity yet</h3>
            <p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">
              Once your workflows begin sending replies, your audience activity will show here.
            </p>
            <Link href="/dashboard/automations" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              Review workflows<ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="border-border py-6 sm:border-r sm:px-6 first:pl-0 last:border-r-0">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  )
}
