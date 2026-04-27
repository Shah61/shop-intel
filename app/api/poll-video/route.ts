import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type AnyRecord = Record<string, unknown>

function pickVideoUrls(data: AnyRecord): string[] {
  const candidates: unknown[] = [
    (data as { signed_urls?: unknown }).signed_urls,
    (data as { video_urls?: unknown }).video_urls,
    (data as { videos?: unknown }).videos,
    (data as { outputs?: unknown }).outputs,
    (data as { result?: { data?: unknown } }).result?.data,
    (data as { data?: unknown }).data,
    // Seedance "unsigned" — last because it requires auth
    (data as { unsigned_urls?: unknown }).unsigned_urls,
  ]

  for (const c of candidates) {
    if (!c) continue
    if (Array.isArray(c) && c.length > 0) {
      const urls = c
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            const obj = item as { url?: string; signed_url?: string }
            return obj.signed_url || obj.url
          }
          return undefined
        })
        .filter((u): u is string => typeof u === 'string' && u.length > 0)
      if (urls.length > 0) return urls
    }
  }
  return []
}

export async function POST(req: NextRequest) {
  try {
    const { pollingUrl } = await req.json()
    if (!pollingUrl) {
      return NextResponse.json({ error: 'Missing pollingUrl' }, { status: 400 })
    }

    const response = await fetch(pollingUrl, {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'Poll failed', details: errText }, { status: response.status })
    }

    const data: AnyRecord = await response.json()

    if (process.env.NODE_ENV !== 'production') {
      console.log('[poll-video] raw status payload:', JSON.stringify(data).slice(0, 800))
    }

    const videoUrls = pickVideoUrls(data)

    return NextResponse.json({
      status: (data as { status?: string }).status,
      videoUrls,
      error: (data as { error?: string }).error,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error', message: (err as Error).message },
      { status: 500 }
    )
  }
}
