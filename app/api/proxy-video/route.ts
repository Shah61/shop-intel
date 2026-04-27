import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  try {
    const target = req.nextUrl.searchParams.get('url')
    const filename = req.nextUrl.searchParams.get('filename')
    if (!target) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(target)
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http(s) allowed' }, { status: 400 })
    }

    const range = req.headers.get('range') ?? undefined

    const upstream = await fetch(parsed.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        ...(range ? { Range: range } : {}),
      },
    })

    if (!upstream.ok && upstream.status !== 206) {
      const text = await upstream.text().catch(() => '')
      return NextResponse.json(
        { error: 'Upstream fetch failed', status: upstream.status, details: text.slice(0, 500) },
        { status: upstream.status }
      )
    }

    const headers = new Headers()
    const passthrough = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']
    for (const h of passthrough) {
      const v = upstream.headers.get(h)
      if (v) headers.set(h, v)
    }
    if (!headers.has('content-type')) headers.set('content-type', 'video/mp4')
    if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')
    headers.set('cache-control', 'private, max-age=300')
    if (filename) {
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'video.mp4'
      headers.set('content-disposition', `attachment; filename="${safe}"`)
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error', message: (err as Error).message },
      { status: 500 }
    )
  }
}
