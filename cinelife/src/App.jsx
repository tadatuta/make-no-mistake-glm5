import { Routes, Route } from 'react-router-dom'
import { MovieProvider } from './context/MovieContext'
import LandingPage from './components/screens/LandingPage'
import CreatePage from './components/screens/CreatePage'
import ResultsPage from './components/screens/ResultsPage'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

function App() {
  return (
    <MovieProvider>
      <div className="min-h-screen flex flex-col bg-midnight">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/result/:id" element={<ResultsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </MovieProvider>
  )
}

export default App
