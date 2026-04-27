import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type FrameImage = {
  type: 'image_url'
  image_url: { url: string }
  frame_type: 'first_frame' | 'last_frame'
}

export async function POST(req: NextRequest) {
  try {
    const {
      firstFrameUrl,
      lastFrameUrl,
      resolution,
      duration,
      prompt,
      aspectRatio,
      model,
    } = await req.json()

    if (!firstFrameUrl?.startsWith('data:image/') && !firstFrameUrl?.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid first frame' }, { status: 400 })
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Always use first-frame; add last-frame when provided (image-to-video w/ end frame).
    const frame_images: FrameImage[] = [
      {
        type: 'image_url',
        image_url: { url: firstFrameUrl },
        frame_type: 'first_frame',
      },
    ]
    const hasLastFrame =
      typeof lastFrameUrl === 'string' &&
      (lastFrameUrl.startsWith('data:image/') || lastFrameUrl.startsWith('http'))
    if (hasLastFrame) {
      frame_images.push({
        type: 'image_url',
        image_url: { url: lastFrameUrl },
        frame_type: 'last_frame',
      })
    }

    const motionPrompt =
      prompt ||
      (hasLastFrame
        ? `Smooth cinematic transition from the first frame to the last frame. Keep the product/subject visually identical between frames — same shape, colors, branding. Natural camera movement and subject animation between the two scenes. ${duration || 5}s, ${resolution || '720p'}.`
        : `Bring this scene to life. Subtle, cinematic motion of the subject and environment while keeping the product/subject visually identical to the input image. ${duration || 5}s, ${resolution || '720p'}.`)

    const body: Record<string, unknown> = {
      model: model || 'bytedance/seedance-2.0',
      prompt: motionPrompt,
      frame_images,
      resolution: resolution || '720p',
      duration: duration || 5,
    }
    if (aspectRatio) body.aspect_ratio = aspectRatio

    if (process.env.NODE_ENV !== 'production') {
      console.log('[generate-video] submit', {
        model: body.model,
        resolution: body.resolution,
        duration: body.duration,
        frames: frame_images.map((f) => f.frame_type),
        promptPreview: motionPrompt.slice(0, 160),
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/videos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'AI Marketing Generator',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[generate-video] submit error:', response.status, errText)
      return NextResponse.json(
        { error: 'Video submission failed', status: response.status, details: errText },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      jobId: result.id,
      pollingUrl: result.polling_url,
      status: result.status,
    })
  } catch (err) {
    console.error('[generate-video] route error:', err)
    return NextResponse.json(
      { error: 'Server error', message: (err as Error).message },
      { status: 500 }
    )
  }
}
