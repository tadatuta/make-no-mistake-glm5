import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'
import Button from '../ui/Button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-midnight/95 backdrop-blur border-b border-silver-screen/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-8 h-8 text-cinema-gold group-hover:text-spotlight transition-colors" />
          <span className="font-primary text-xl font-bold text-white">
            Cine<span className="text-cinema-gold">Life</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            to="/create"
            className="hidden sm:block text-silver-screen hover:text-white transition-colors"
          >
            Create
          </Link>
          <Link to="/create">
            <Button size="sm">
              🎬 Create Your Movie
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
