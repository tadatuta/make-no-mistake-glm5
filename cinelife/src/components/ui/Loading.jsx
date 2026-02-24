import { Film, Clapperboard, Star, Sparkles } from 'lucide-react'

export default function Loading({ message = 'Directing your movie...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Animated Film Reel */}
      <div className="relative">
        <div className="flex items-center gap-4">
          <Film className="w-12 h-12 text-cinema-gold animate-spin-slow" />
          <Sparkles className="w-8 h-8 text-spotlight animate-pulse" />
          <Clapperboard className="w-12 h-12 text-cinema-gold animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-xl font-primary text-white mb-4">{message}</p>

        {/* Loading dots */}
        <div className="loading-dots flex justify-center gap-1">
          <span className="w-2 h-2 bg-cinema-gold rounded-full"></span>
          <span className="w-2 h-2 bg-cinema-gold rounded-full"></span>
          <span className="w-2 h-2 bg-cinema-gold rounded-full"></span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3 text-left w-full max-w-xs">
        <LoadingStep label="Casting characters" complete />
        <LoadingStep label="Crafting plot" complete />
        <LoadingStep label="Designing poster" active />
        <LoadingStep label="Final cut" />
      </div>
    </div>
  )
}

function LoadingStep({ label, complete = false, active = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-5 h-5 rounded-full flex items-center justify-center text-xs
        ${complete ? 'bg-success text-white' : active ? 'bg-cinema-gold text-midnight animate-pulse' : 'bg-silver-screen/20 text-silver-screen/50'}
      `}>
        {complete ? '✓' : active ? '◐' : '○'}
      </div>
      <span className={`
        text-sm
        ${complete ? 'text-success' : active ? 'text-cinema-gold' : 'text-silver-screen/50'}
      `}>
        {label}
      </span>
    </div>
  )
}
