import { Link } from 'react-router-dom'
import { Star, Clapperboard, Sparkles, Users } from 'lucide-react'
import Button from '../ui/Button'

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-velvet via-midnight to-midnight" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cinema-gold/10 border border-cinema-gold/30 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-cinema-gold" />
              <span className="text-sm text-cinema-gold">AI-Powered Movie Generator</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-hero font-primary font-bold text-white mb-6">
              Your Life. <span className="text-gradient">The Movie.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-silver-screen mb-8 max-w-2xl mx-auto">
              Transform your story into a cinematic masterpiece. Get your AI-generated movie poster,
              title, and plot in just 5 minutes.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/create">
                <Button size="lg">
                  🎬 Create Your Movie
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                See Examples
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12 text-silver-screen">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm">Movies Created</div>
              </div>
              <div className="w-px h-10 bg-silver-screen/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-sm">User Rating</div>
              </div>
              <div className="w-px h-10 bg-silver-screen/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-sm">To Start</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Posters */}
      <section className="py-16 bg-velvet">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-primary font-bold text-center text-white mb-12">
            See What Others Created
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <ExamplePoster
              title="Finding Sarah"
              genre="Drama"
              image="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop"
            />
            <ExamplePoster
              title="The Climb"
              genre="Thriller"
              image="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop"
            />
            <ExamplePoster
              title="Chasing Tomorrow"
              genre="Romance"
              image="https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop"
            />
            <ExamplePoster
              title="Breaking Through"
              genre="Action"
              image="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-midnight">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-primary font-bold text-center text-white mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              icon={<Clapperboard className="w-8 h-8" />}
              title="Tell Your Story"
              description="Answer a few questions about your life journey, key moments, and dreams."
            />
            <StepCard
              number={2}
              icon={<Sparkles className="w-8 h-8" />}
              title="AI Creates Magic"
              description="Our AI transforms your story into a cinematic narrative with title, plot, and poster."
            />
            <StepCard
              number={3}
              icon={<Star className="w-8 h-8" />}
              title="Share Your Movie"
              description="Download your poster and share your life movie with friends and family."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-velvet">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-primary font-bold text-center text-white mb-12">
            What People Are Saying
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              quote="I never thought my life could be a movie! The AI captured my journey perfectly."
              author="Sarah M."
              role="Entrepreneur"
            />
            <TestimonialCard
              quote="Made the best birthday gift for my mom. She cried happy tears seeing her life as a film."
              author="Mike T."
              role="Software Engineer"
            />
            <TestimonialCard
              quote="The poster looks so professional! My friends thought I hired a designer."
              author="Emma L."
              role="Content Creator"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-midnight">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-primary font-bold text-white mb-4">
            Ready to See Your Life as a Movie?
          </h2>
          <p className="text-silver-screen mb-8 max-w-xl mx-auto">
            Join thousands who've already discovered their cinematic story.
          </p>
          <Link to="/create">
            <Button size="lg">
              🎬 Create Your Movie — It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function ExamplePoster({ title, genre, image }) {
  return (
    <div className="poster-card group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-primary font-bold text-white text-lg">{title}</h3>
          <span className="genre-badge text-xs">{genre}</span>
        </div>
      </div>
    </div>
  )
}

function StepCard({ number, icon, title, description }) {
  return (
    <div className="card text-center">
      <div className="w-16 h-16 rounded-full bg-cinema-gold/10 border border-cinema-gold/30 flex items-center justify-center mx-auto mb-4 text-cinema-gold">
        {icon}
      </div>
      <div className="text-cinema-gold text-sm font-medium mb-2">Step {number}</div>
      <h3 className="font-primary font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-silver-screen text-sm">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="card">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
        ))}
      </div>
      <p className="text-white mb-4">"{quote}"</p>
      <div>
        <div className="font-medium text-white">{author}</div>
        <div className="text-sm text-silver-screen">{role}</div>
      </div>
    </div>
  )
}
