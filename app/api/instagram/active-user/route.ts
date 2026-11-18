import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: user } = await supabase
      .from("users")
      .select("id, username")
      .neq("username", "Automation System User")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (!user) return NextResponse.json({ user: null })

    const response = NextResponse.json({
      user: {
        userId: user.id.toString(),
        username: user.username,
      },
    })

    response.cookies.set(
      "insta_session",
      JSON.stringify({ username: user.username, userId: user.id.toString() }),
      {
        path: "/",
        maxAge: 60 * 24 * 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      }
    )

    return response
  } catch {
    return NextResponse.json({ user: null })
  }
}
