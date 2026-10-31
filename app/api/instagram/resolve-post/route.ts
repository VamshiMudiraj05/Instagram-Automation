import { type NextRequest, NextResponse } from "next/server"

function shortcodeToId(shortcode: string): string {
  try {
    let id = 0n
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    for (let i = 0; i < shortcode.length; i++) {
      const idx = alphabet.indexOf(shortcode[i])
      if (idx === -1) return shortcode
      id = id * 64n + BigInt(idx)
    }
    return id.toString()
  } catch {
    return shortcode
  }
}

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get("url")
    if (!urlParam) return NextResponse.json({ error: "Missing url" }, { status: 400 })

    const match = urlParam.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/)
    const shortcode = match ? match[1] : urlParam.trim()
    const numericId = shortcodeToId(shortcode)

    let imageUrl: string | null = null
    let caption: string = `Instagram Reel (${shortcode})`

    // Extract cover image and caption from public embed preview
    try {
      const embedRes = await fetch(`https://www.instagram.com/reel/${shortcode}/embed/captioned/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      })
      if (embedRes.ok) {
        const html = await embedRes.text()
        const imgMatch = html.match(/<img[^>]+class="EmbeddedMediaImage"[^>]+src="([^">]+)"/)
        if (imgMatch) {
          imageUrl = imgMatch[1].replace(/&amp;/g, "&")
        }
        const captionMatch = html.match(/<div class="Caption">[\s\S]*?<br \/>([\s\S]*?)<\/div>/)
        if (captionMatch) {
          caption = captionMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 80)
        }
      }
    } catch (e) {
      console.warn("Embed fetch failed:", e)
    }

    return NextResponse.json({
      id: numericId,
      shortcode,
      caption,
      image_url: imageUrl,
      permalink: `https://www.instagram.com/reel/${shortcode}/`,
      media_type: "VIDEO",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
