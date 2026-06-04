import { NextRequest } from "next/server"

const FORM_URLS: Record<string, string> = {
  "sf-424":  "https://apply07.grants.gov/apply/forms/sample/SF424_4_0-V4.0.pdf",
  "sf-424a": "https://apply07.grants.gov/apply/forms/sample/SF424A_4_0-V4.0.pdf",
  "sf-424b": "https://apply07.grants.gov/apply/forms/sample/SF424B_4_0-V4.0.pdf",
  "sf-lll":  "https://apply07.grants.gov/apply/forms/sample/SFLLL_2_0-V2.0.pdf",
}

export const revalidate = 86400 // cache PDF responses for 1 day at the edge

export async function GET(req: NextRequest) {
  const form = new URL(req.url).searchParams.get("form") ?? ""
  const upstream = FORM_URLS[form]
  if (!upstream) return new Response("Unknown form key", { status: 404 })

  try {
    const res = await fetch(upstream, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return new Response(`Upstream returned ${res.status}`, { status: 502 })
    const bytes = await res.arrayBuffer()
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (err) {
    console.error("[pdf-proxy]", form, err)
    return new Response("Failed to fetch form template", { status: 502 })
  }
}
