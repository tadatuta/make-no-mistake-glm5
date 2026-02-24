// API endpoint for poster generation using Replicate/FLUX
// This is a Vercel serverless function

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check origin for security
  const origin = req.headers.origin
  const allowedOrigins = [
    'http://localhost:3000',
    'https://cinelife.app',
    'https://cinelife.vercel.app'
  ]

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  try {
    const { title, genre, plotSummary } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Missing title' })
    }

    // Check if Replicate API token is available
    if (!process.env.REPLICATE_API_TOKEN) {
      // Return fallback image for demo
      return res.status(200).json({
        imageUrl: getFallbackPoster(genre),
        fallback: true
      })
    }

    // Build prompt for poster generation
    const prompt = buildPosterPrompt(title, genre, plotSummary)

    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt: prompt,
          aspect_ratio: "2:3",
          output_quality: 90,
          num_outputs: 1
        }
      })
    })

    if (!response.ok) {
      throw new Error('Replicate API error')
    }

    const prediction = await response.json()

    // Poll for result
    const imageUrl = await pollForResult(prediction.urls.get)

    return res.status(200).json({ imageUrl })

  } catch (error) {
    console.error('Poster generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate poster',
      fallback: true,
      imageUrl: getFallbackPoster('Drama')
    })
  }
}

function buildPosterPrompt(title, genre, plotSummary) {
  const styleGuide = getStyleGuide(genre)

  return `Professional movie poster for "${title}".
          Genre: ${genre || 'Drama'}.
          ${styleGuide}
          Style: Cinematic, theatrical release quality, professional movie poster design.
          Composition: Compelling visual hierarchy, title prominently displayed.
          Mood: Dramatic lighting, atmospheric, evocative.
          Important: No faces or people visible - use silhouettes, symbols, or abstract imagery.
          Text: Movie title "${title}" should be clearly visible in cinematic typography.
          Quality: High resolution, suitable for printing.`
}

function getStyleGuide(genre) {
  const guides = {
    'Drama / Coming-of-Age': 'Warm golden tones, sunrise/sunset imagery, paths or roads, growth symbolism.',
    'Drama / Thriller': 'Dark shadows, high contrast, mysterious atmosphere, tension in composition.',
    'Romance / Drama': 'Soft lighting, warm colors, intimate atmosphere, romantic imagery.',
    'Comedy / Drama': 'Bright colors, playful composition, uplifting imagery.',
    'Action / Adventure': 'Dynamic composition, bold colors, exciting imagery, movement.',
    'Mystery / Thriller': 'Dark moody atmosphere, shadows, enigmatic imagery, suspense.'
  }

  return guides[genre] || guides['Drama / Coming-of-Age']
}

async function pollForResult(statusUrl) {
  const maxAttempts = 60
  const delayMs = 1000

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(statusUrl, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to check prediction status')
    }

    const prediction = await response.json()

    if (prediction.status === 'succeeded') {
      return prediction.output[0]
    }

    if (prediction.status === 'failed') {
      throw new Error('Image generation failed')
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  throw new Error('Image generation timed out')
}

function getFallbackPoster(genre) {
  // Use Unsplash images as fallback placeholders
  const genreImages = {
    'Drama / Coming-of-Age': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1200&fit=crop',
    'Drama / Thriller': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=1200&fit=crop',
    'Romance / Drama': 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=1200&fit=crop',
    'Comedy / Drama': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop',
    'Action / Adventure': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1200&fit=crop',
    'Mystery / Thriller': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=1200&fit=crop'
  }

  return genreImages[genre] || genreImages['Drama / Coming-of-Age']
}
