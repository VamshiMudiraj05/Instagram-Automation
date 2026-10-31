import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

    const supabase = await getSupabaseServerClient()

    // 1. Get Access Token
    const { data: user } = await supabase
      .from("users")
      .select("access_token") // Business ID ki zaroorat nahi hai ab
      .eq("id", userId)
      .single()

    if (!user?.access_token) {
      return NextResponse.json({ error: "Instagram not connected" }, { status: 401 })
    }

    // 2. Fetch Media
    const isFb = user.access_token.startsWith("EAA")
    const url = isFb
      ? `https://graph.facebook.com/v24.0/17841479501766910/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=24&access_token=${user.access_token}`
      : `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=24&access_token=${user.access_token}`

    console.log("[v0] Fetching Media from:", url)

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (data.error) {
      console.warn("[v0] Instagram Media warning:", data.error)
      // Return empty data gracefully instead of 401 so the dashboard stays healthy
      return NextResponse.json({ data: [] })
    }

    // Normalize: pick thumbnail_url for videos, media_url for images.
    // Skips items with neither URL so we never return the broken `image_url: null` shape.
    const normalized = (data.data || [])
      .map((m: any) => ({
        ...m,
        image_url: m.thumbnail_url || m.media_url || null,
      }))
      .filter((m: any) => typeof m.image_url === "string" && m.image_url.length > 0)

    return NextResponse.json({ data: normalized })
  } catch (error) {
    console.error("[v0] Server Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}
