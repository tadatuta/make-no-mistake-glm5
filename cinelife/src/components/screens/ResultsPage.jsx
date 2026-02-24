import { useParams, Link } from 'react-router-dom'
import { Download, Share2, RefreshCw, ChevronDown, ChevronUp, Film, Link as LinkIcon } from 'lucide-react'
import { useMovie } from '../../context/MovieContext'
import Button from '../ui/Button'
import { useState } from 'react'

export default function ResultsPage() {
  const { id } = useParams()
  const { state, regenerate, reset } = useMovie()
  const { movieResult, regenerationsLeft, userInput } = state
  const [expandedSections, setExpandedSections] = useState({
    plot: false,
    characters: false
  })

  if (!movieResult) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Film className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
        <h2 className="text-2xl font-primary font-bold text-white mb-4">No Movie Found</h2>
        <p className="text-silver-screen mb-8">Let's create your movie!</p>
        <Link to="/create">
          <Button>Create Your Movie</Button>
        </Link>
      </div>
    )
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleDownload = async () => {
    // Create download link for poster
    const link = document.createElement('a')
    link.href = movieResult.posterUrl
    link.download = `${movieResult.title.replace(/\s+/g, '-').toLowerCase()}-poster.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    const shareData = {
      title: `${movieResult.title} - My Life Movie`,
      text: `Check out my life as a movie! "${movieResult.title}" - ${movieResult.logline}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  const handleRegenerate = async (type) => {
    if (regenerationsLeft <= 0) {
      alert('No regenerations left. Upgrade to Pro for unlimited regenerations!')
      return
    }

    try {
      const { regenerateComponent } = await import('../../services/aiService')
      const newValue = await regenerateComponent(type, userInput, movieResult)
      regenerate(type, newValue)
    } catch (error) {
      console.error('Regeneration failed:', error)
      alert('Failed to regenerate. Please try again.')
    }
  }

  const handleNewMovie = () => {
    reset()
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/create" onClick={handleNewMovie}>
          <Button variant="ghost" size="sm">
            ← New Movie
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Poster */}
        <div className="space-y-4">
          <div className="poster-card">
            <img
              src={movieResult.posterUrl}
              alt={`${movieResult.title} movie poster`}
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Regenerate Poster */}
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleRegenerate('poster')}
            disabled={regenerationsLeft <= 0}
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate Poster
            <span className="text-xs text-silver-screen">
              ({regenerationsLeft} left)
            </span>
          </Button>
        </div>

        {/* Movie Details */}
        <div className="space-y-6">
          {/* Title & Genre */}
          <div>
            <h1 className="text-3xl md:text-4xl font-primary font-bold text-white mb-2">
              ★ {movieResult.title} ★
            </h1>
            <span className="genre-badge">{movieResult.genre}</span>
          </div>

          {/* Logline */}
          <div className="card">
            <p className="text-lg text-white italic">
              "{movieResult.logline}"
            </p>
          </div>

          {/* Plot Summary */}
          <div className="card">
            <button
              onClick={() => toggleSection('plot')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-primary font-bold text-white flex items-center gap-2">
                📖 Plot Summary
              </h3>
              {expandedSections.plot ? (
                <ChevronUp className="w-5 h-5 text-cinema-gold" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cinema-gold" />
              )}
            </button>

            {expandedSections.plot && (
              <div className="mt-4 space-y-4 text-silver-screen">
                <div>
                  <h4 className="font-medium text-white mb-1">Act 1: Setup</h4>
                  <p>{movieResult.plot.act1}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Act 2: Confrontation</h4>
                  <p>{movieResult.plot.act2}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Act 3: Resolution</h4>
                  <p>{movieResult.plot.act3}</p>
                </div>
              </div>
            )}
          </div>

          {/* Characters */}
          <div className="card">
            <button
              onClick={() => toggleSection('characters')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-primary font-bold text-white flex items-center gap-2">
                👥 Characters
              </h3>
              {expandedSections.characters ? (
                <ChevronUp className="w-5 h-5 text-cinema-gold" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cinema-gold" />
              )}
            </button>

            {expandedSections.characters && (
              <div className="mt-4 space-y-3">
                {movieResult.characters.map((character, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-cinema-gold/20 flex items-center justify-center text-cinema-gold font-bold">
                      {character.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{character.name}</h4>
                      <p className="text-sm text-cinema-gold">{character.role}</p>
                      <p className="text-sm text-silver-screen">{character.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="flex-1">
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="flex-1">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Watermark Notice */}
      <div className="mt-8 text-center text-sm text-silver-screen/50">
        <p>Made with CineLife • Your Life. The Movie.</p>
      </div>
    </div>
  )
}
