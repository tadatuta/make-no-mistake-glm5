// API endpoint for text generation using OpenAI
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
    const { type, input } = req.body

    if (!type || !input) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Generate prompt based on type
    const prompt = getPrompt(type, input)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Return fallback response for demo
      return res.status(200).json({
        result: getFallbackResponse(type, input)
      })
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative Hollywood screenwriter helping to transform life stories into cinematic narratives. Be creative, engaging, and professional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const result = data.choices[0].message.content.trim()

    return res.status(200).json({ result })

  } catch (error) {
    console.error('Text generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate content',
      fallback: true
    })
  }
}

function getPrompt(type, input) {
  const { name, age, events, challenge, achievement, goal, people, mood } = input

  switch (type) {
    case 'title':
      return `Generate a compelling movie title for a story about ${name}, a ${age}-year-old whose life events include: ${events?.join(', ') || 'various experiences'}.
              The mood should be ${mood || 'inspiring'}.
              Return ONLY the movie title, nothing else. Make it catchy and memorable like real Hollywood movies.`

    case 'logline':
      return `Create a one-sentence Hollywood logline for a movie about ${name}.
              Key events: ${events?.join(', ') || 'life journey'}.
              Main challenge: ${challenge || 'personal growth'}.
              Achievement: ${achievement || 'self-discovery'}.
              Format: One compelling sentence, under 30 words, that captures the essence of the story.`

    case 'genre':
      return `Determine the most appropriate movie genre for a story with these elements:
              Protagonist: ${name}, ${age} years old
              Key events: ${events?.join(', ') || 'life journey'}
              Mood: ${mood || 'inspiring'}
              Return ONLY the genre classification in format "Primary Genre / Secondary Genre" (e.g., "Drama / Coming-of-Age").`

    case 'plot':
      return `Write a 3-act plot summary for a movie:
              Protagonist: ${name}, ${age}
              Key events: ${events?.join(', ') || 'life journey'}
              Main challenge: ${challenge || 'overcoming obstacles'}
              Achievement: ${achievement || 'personal growth'}
              Goal: ${goal || 'finding purpose'}

              Format your response as JSON:
              {
                "act1": "2-3 sentences setting up the story",
                "act2": "3-4 sentences describing the conflict and challenges",
                "act3": "2-3 sentences describing the resolution"
              }
              Return ONLY valid JSON.`

    case 'characters':
      return `Describe the main characters for a movie:
              Protagonist: ${name}, ${age}
              Supporting characters: ${people?.join(', ') || 'family and friends'}

              Format your response as a JSON array:
              [
                {
                  "name": "Character name",
                  "role": "Protagonist/Supporting/Antagonist",
                  "description": "Brief character description"
                }
              ]
              Return ONLY valid JSON array.`

    default:
      return `Generate creative content for a movie about ${name}.`
  }
}

function getFallbackResponse(type, input) {
  const { name, age, events, mood } = input

  switch (type) {
    case 'title':
      const titles = [
        `Finding ${name}`,
        `The ${name} Story`,
        `${name}'s Journey`,
        'Chasing Tomorrow',
        'The Climb',
        'Breaking Through'
      ]
      return titles[Math.floor(Math.random() * titles.length)]

    case 'logline':
      return `A ${age}-year-old's inspiring journey through ${events?.[0]?.toLowerCase() || 'life'}, discovering strength and purpose along the way.`

    case 'genre':
      const moodGenres = {
        'inspiring': 'Drama / Coming-of-Age',
        'dramatic': 'Drama / Thriller',
        'romantic': 'Romance / Drama',
        'comedic': 'Comedy / Drama',
        'adventurous': 'Action / Adventure',
        'mysterious': 'Mystery / Thriller'
      }
      return moodGenres[mood] || 'Drama / Coming-of-Age'

    case 'plot':
      return JSON.stringify({
        act1: `${name}, ${age}, begins their story with ${events?.[0] || 'a life-changing moment'}. The world as they know it is about to change forever.`,
        act2: `Facing challenges and obstacles, ${name} must confront their greatest fears. With the support of loved ones, they find the strength to persevere.`,
        act3: `In a triumphant conclusion, ${name} achieves their dreams and realizes that every step of the journey was leading to this moment.`
      })

    case 'characters':
      return JSON.stringify([
        {
          name: name,
          role: 'Protagonist',
          description: `A determined ${age}-year-old on a journey of self-discovery`
        }
      ])

    default:
      return 'Generated content'
  }
}
