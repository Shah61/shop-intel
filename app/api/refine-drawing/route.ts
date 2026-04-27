import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const MODELS = {
  geminiFlash: 'google/gemini-2.5-flash-image',
  geminiPro: 'google/gemini-3-pro-image-preview',
  fluxPro: 'black-forest-labs/flux.2-pro',
} as const

export async function POST(req: NextRequest) {
  try {
    const {
      imageDataUrl,
      model,
      description,
      title,
      previousEnhancedUrl, // ← NEW: previous scene's enhanced image
      sceneIndex,          // ← NEW: which scene number (0-based)
    } = await req.json()

    if (!imageDataUrl?.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data URL' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const hasDescription = description && description.trim().length > 0
    const hasPrevious = previousEnhancedUrl?.startsWith('data:image/')
    const sceneNum = (sceneIndex ?? 0) + 1

    // Build prompt based on whether this is a sequel scene or standalone
    let prompt: string

    if (hasPrevious) {
      // SEQUEL SCENE — must maintain product consistency with previous
      prompt = `You are generating scene ${sceneNum} of a connected storyboard sequence (like an ad campaign).

CRITICAL CONSISTENCY RULE — the product/hero subject from the FIRST image must appear EXACTLY identical in this new scene. Same shape, same colors, same labels, same proportions, same design details. Treat the product as a fixed asset that gets placed into different scenes — like 3D rendering the same model in different environments.

What CAN change between scenes:
- Background, environment, setting
- Lighting, atmosphere, mood
- Camera angle and perspective
- Action happening around the product
- Surrounding props and elements

What CANNOT change:
- The product itself (logo, color, shape, materials, label, branding)
- The product's identity — viewers must instantly recognize it as the same item

The SECOND image is a rough sketch showing the composition for this new scene — use it as a layout guide for where the product sits and what's happening around it.

${hasDescription ? `Scene ${sceneNum} description: "${description}"` : ''}
${title ? `Scene ${sceneNum} title: "${title}"` : ''}

Generate a polished, professional commercial photography image for this new scene, with the product looking IDENTICAL to how it appeared in the first image.`
    } else if (hasDescription) {
      // FIRST SCENE with description
      prompt = `Transform this rough sketch into a polished, professional image based on this description:

"${description}"

The sketch shows the composition and layout. Use the sketch's positioning, proportions, and subject placement as a guide — but render the final image based on the description above. Make it look like high-quality commercial photography with proper colors, lighting, shading, and detail.${title ? `\n\nScene title: "${title}"` : ''}`
    } else {
      // FIRST SCENE without description
      prompt = `Refine this rough sketch into a polished, professional marketing visual. 
Preserve the original composition, layout, and subject placement exactly as drawn — but transform 
the rough lines into a high-quality illustration with proper colors, shading, lighting, and detail.
Make it look like commercial photography or premium digital art.${title ? `\n\nScene title: "${title}"` : ''}`
    }

    // Build messages array — multi-image when we have a previous scene
    const userContent: any[] = [{ type: 'text', text: prompt }]

    if (hasPrevious) {
      // Order matters: previous scene FIRST so the model treats it as the reference
      userContent.push({ type: 'image_url', image_url: { url: previousEnhancedUrl } })
    }
    userContent.push({ type: 'image_url', image_url: { url: imageDataUrl } })

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'AI Marketing Generator',
      },
      body: JSON.stringify({
        model: model || MODELS.geminiFlash,
        modalities: ['image', 'text'],
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return NextResponse.json(
        { error: 'Generation failed', details: errText },
        { status: response.status }
      )
    }

    const result = await response.json()
    const enhancedUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url

    if (!enhancedUrl) {
      console.error('No image in response:', JSON.stringify(result, null, 2))
      return NextResponse.json({ error: 'No image returned from model' }, { status: 500 })
    }

    return NextResponse.json({ enhancedUrl, isSequel: hasPrevious })
  } catch (err) {
    console.error('Refine route error:', err)
    return NextResponse.json(
      { error: 'Server error', message: (err as Error).message },
      { status: 500 }
    )
  }
}