// AI Service for generating movie content
// This service handles all AI generation calls

const API_BASE = '/api'

// Generate a unique ID for the movie
function generateId() {
  return `movie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Main function to generate complete movie
export async function generateMovie(userInput) {
  const id = generateId()

  try {
    // Generate all text content in parallel
    const [title, logline, genre, plot, characters] = await Promise.all([
      generateTitle(userInput),
      generateLogline(userInput),
      generateGenre(userInput),
      generatePlot(userInput),
      generateCharacters(userInput)
    ])

    // Generate poster after we have title and genre
    const posterUrl = await generatePoster({ title, genre, plotSummary: plot.act1 })

    return {
      id,
      title,
      logline,
      genre,
      plot,
      characters,
      posterUrl,
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating movie:', error)
    throw new Error('Failed to generate movie. Please try again.')
  }
}

// Generate movie title
async function generateTitle(userInput) {
  try {
    const response = await fetch(`${API_BASE}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'title',
        input: userInput
      })
    })

    if (!response.ok) throw new Error('Failed to generate title')

    const data = await response.json()
    return data.result
  } catch (error) {
    // Fallback to client-side generation for demo
    return generateFallbackTitle(userInput)
  }
}

// Generate logline
async function generateLogline(userInput) {
  try {
    const response = await fetch(`${API_BASE}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'logline',
        input: userInput
      })
    })

    if (!response.ok) throw new Error('Failed to generate logline')

    const data = await response.json()
    return data.result
  } catch (error) {
    return generateFallbackLogline(userInput)
  }
}

// Generate genre classification
async function generateGenre(userInput) {
  try {
    const response = await fetch(`${API_BASE}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'genre',
        input: userInput
      })
    })

    if (!response.ok) throw new Error('Failed to generate genre')

    const data = await response.json()
    return data.result
  } catch (error) {
    return generateFallbackGenre(userInput)
  }
}

// Generate plot summary
async function generatePlot(userInput) {
  try {
    const response = await fetch(`${API_BASE}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'plot',
        input: userInput
      })
    })

    if (!response.ok) throw new Error('Failed to generate plot')

    const data = await response.json()
    return data.result
  } catch (error) {
    return generateFallbackPlot(userInput)
  }
}

// Generate character descriptions
async function generateCharacters(userInput) {
  try {
    const response = await fetch(`${API_BASE}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'characters',
        input: userInput
      })
    })

    if (!response.ok) throw new Error('Failed to generate characters')

    const data = await response.json()
    return data.result
  } catch (error) {
    return generateFallbackCharacters(userInput)
  }
}

// Generate movie poster
async function generatePoster({ title, genre, plotSummary }) {
  try {
    const response = await fetch(`${API_BASE}/generate/poster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, genre, plotSummary })
    })

    if (!response.ok) throw new Error('Failed to generate poster')

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    // Return a placeholder image for demo
    return getPlaceholderPoster(genre)
  }
}

// Fallback generators for demo/offline mode
function generateFallbackTitle(userInput) {
  const templates = [
    `Finding ${userInput.name}`,
    `The ${userInput.name} Story`,
    `${userInput.name}'s Journey`,
    `Chasing Tomorrow`,
    `The Climb`,
    `Breaking Through`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateFallbackLogline(userInput) {
  const events = userInput.events?.[0] || 'life journey'
  return `A ${userInput.age}-year-old's inspiring journey through ${events.toLowerCase()}, discovering strength and purpose along the way.`
}

function generateFallbackGenre(userInput) {
  const moodGenres = {
    'inspiring': 'Drama / Coming-of-Age',
    'dramatic': 'Drama / Thriller',
    'romantic': 'Romance / Drama',
    'comedic': 'Comedy / Drama',
    'adventurous': 'Action / Adventure',
    'mysterious': 'Mystery / Thriller'
  }
  return moodGenres[userInput.mood] || 'Drama / Coming-of-Age'
}

function generateFallbackPlot(userInput) {
  return {
    act1: `${userInput.name}, ${userInput.age}, begins their story with ${userInput.events?.[0] || 'a life-changing moment'}. The world as they know it is about to change forever.`,
    act2: `Facing challenges and obstacles, ${userInput.name} must confront ${userInput.challenge || 'their greatest fears'}. With the support of ${userInput.people?.[0] || 'loved ones'}, they find the strength to persevere.`,
    act3: `In a triumphant conclusion, ${userInput.name} achieves ${userInput.achievement || 'their dreams'} and realizes that every step of the journey was leading to this moment.`
  }
}

function generateFallbackCharacters(userInput) {
  const characters = [
    {
      name: userInput.name,
      role: 'Protagonist',
      description: `A determined ${userInput.age}-year-old on a journey of self-discovery`
    }
  ]

  if (userInput.people && userInput.people.length > 0) {
    userInput.people.slice(0, 2).forEach((person, i) => {
      characters.push({
        name: person.split(' - ')[0],
        role: `Supporting Character`,
        description: person.includes('-') ? person.split(' - ')[1] : 'A key figure in the story'
      })
    })
  }

  return characters
}

function getPlaceholderPoster(genre) {
  // Use Unsplash images as placeholders
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

// Regenerate specific component
export async function regenerateComponent(type, userInput, currentMovie) {
  switch (type) {
    case 'title':
      return generateTitle(userInput)
    case 'poster':
      return generatePoster({
        title: currentMovie.title,
        genre: currentMovie.genre,
        plotSummary: currentMovie.plot.act1
      })
    case 'all':
      return generateMovie(userInput)
    default:
      throw new Error('Invalid regeneration type')
  }
}
