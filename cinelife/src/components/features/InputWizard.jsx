import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useMovie } from '../../context/MovieContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Progress from '../ui/Progress'
import Loading from '../ui/Loading'
import { generateMovie } from '../../services/aiService'

const MOOD_OPTIONS = [
  { value: 'inspiring', label: 'Inspiring & Uplifting' },
  { value: 'dramatic', label: 'Dramatic & Intense' },
  { value: 'romantic', label: 'Romantic & Heartwarming' },
  { value: 'comedic', label: 'Comedic & Light' },
  { value: 'adventurous', label: 'Adventurous & Exciting' },
  { value: 'mysterious', label: 'Mysterious & Intriguing' }
]

export default function InputWizard() {
  const navigate = useNavigate()
  const { state, setStep, updateInput, setGenerating, setMovieResult, setError } = useMovie()
  const [errors, setErrors] = useState({})
  const [newEvent, setNewEvent] = useState('')
  const [newPerson, setNewPerson] = useState('')

  const { currentStep, totalSteps, userInput, isGenerating, error } = state

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!userInput.name.trim()) newErrors.name = 'Name is required'
        if (!userInput.age || userInput.age < 1 || userInput.age > 120) {
          newErrors.age = 'Please enter a valid age (1-120)'
        }
        break
      case 2:
        if (!userInput.events || userInput.events.length === 0) {
          newErrors.events = 'At least one life event is required'
        }
        break
      case 3:
        // Optional step, no validation
        break
      case 4:
        // Optional step, no validation
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    }
  }

  const handleAddEvent = () => {
    if (newEvent.trim()) {
      updateInput({ events: [...(userInput.events || []), newEvent.trim()] })
      setNewEvent('')
    }
  }

  const handleRemoveEvent = (index) => {
    const newEvents = userInput.events.filter((_, i) => i !== index)
    updateInput({ events: newEvents })
  }

  const handleAddPerson = () => {
    if (newPerson.trim()) {
      updateInput({ people: [...(userInput.people || []), newPerson.trim()] })
      setNewPerson('')
    }
  }

  const handleRemovePerson = (index) => {
    const newPeople = userInput.people.filter((_, i) => i !== index)
    updateInput({ people: newPeople })
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setGenerating(true)

    try {
      const result = await generateMovie(userInput)
      setMovieResult(result)
      navigate(`/result/${result.id}`)
    } catch (err) {
      setError(err.message || 'Failed to generate movie. Please try again.')
    }
  }

  if (isGenerating) {
    return <Loading message="Directing your movie..." />
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-error text-6xl mb-4">:(</div>
        <h2 className="text-2xl font-primary font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-silver-screen mb-8">{error}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-8">
        <Progress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Step Content */}
      <div className="card">
        {currentStep === 1 && (
          <Step1
            userInput={userInput}
            updateInput={updateInput}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2
            userInput={userInput}
            updateInput={updateInput}
            errors={errors}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            handleAddEvent={handleAddEvent}
            handleRemoveEvent={handleRemoveEvent}
          />
        )}
        {currentStep === 3 && (
          <Step3
            userInput={userInput}
            updateInput={updateInput}
            errors={errors}
            newPerson={newPerson}
            setNewPerson={setNewPerson}
            handleAddPerson={handleAddPerson}
            handleRemovePerson={handleRemovePerson}
          />
        )}
        {currentStep === 4 && (
          <Step4
            userInput={userInput}
            updateInput={updateInput}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={currentStep === 1 ? 'invisible' : ''}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            Generate My Movie
          </Button>
        )}
      </div>
    </div>
  )
}

function Step1({ userInput, updateInput, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-primary font-bold text-white mb-2">
          Let's create your movie! <span className="text-2xl"></span>
        </h2>
        <p className="text-silver-screen">
          First, tell us about the main character (that's you!)
        </p>
      </div>

      <Input
        label="Name"
        name="name"
        placeholder="Your name"
        value={userInput.name}
        onChange={(e) => updateInput({ name: e.target.value })}
        error={errors.name}
        required
      />

      <Input
        label="Age"
        name="age"
        type="number"
        placeholder="Your age"
        value={userInput.age}
        onChange={(e) => updateInput({ age: e.target.value })}
        error={errors.age}
        required
      />
    </div>
  )
}

function Step2({ userInput, updateInput, errors, newEvent, setNewEvent, handleAddEvent, handleRemoveEvent }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-primary font-bold text-white mb-2">
          What are the key moments in your story?
        </h2>
        <p className="text-silver-screen">
          Add the events that shaped your life
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {userInput.events?.map((event, index) => (
          <div key={index} className="flex items-center gap-2 bg-velvet rounded-lg p-3">
            <span className="flex-1 text-white">{event}</span>
            <button
              onClick={() => handleRemoveEvent(index)}
              className="text-silver-screen hover:text-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Event */}
      <div className="flex gap-2">
        <Input
          name="newEvent"
          placeholder="e.g., Graduated college in 2018"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          className="flex-1"
          error={errors.events}
        />
        <Button onClick={handleAddEvent} variant="secondary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Textarea
        label="Biggest challenge you've faced (optional)"
        name="challenge"
        placeholder="What obstacles have you overcome?"
        value={userInput.challenge}
        onChange={(e) => updateInput({ challenge: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Proudest achievement (optional)"
        name="achievement"
        placeholder="What are you most proud of?"
        value={userInput.achievement}
        onChange={(e) => updateInput({ achievement: e.target.value })}
        rows={3}
      />
    </div>
  )
}

function Step3({ userInput, updateInput, errors, newPerson, setNewPerson, handleAddPerson, handleRemovePerson }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-primary font-bold text-white mb-2">
          Who are the important characters?
        </h2>
        <p className="text-silver-screen">
          Add the people who play key roles in your story
        </p>
      </div>

      {/* People List */}
      <div className="space-y-3">
        {userInput.people?.map((person, index) => (
          <div key={index} className="flex items-center gap-2 bg-velvet rounded-lg p-3">
            <span className="flex-1 text-white">{person}</span>
            <button
              onClick={() => handleRemovePerson(index)}
              className="text-silver-screen hover:text-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Person */}
      <div className="flex gap-2">
        <Input
          name="newPerson"
          placeholder="e.g., Mom - my biggest supporter"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAddPerson} variant="secondary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Input
        label="Current goal or dream (optional)"
        name="goal"
        placeholder="What are you working towards?"
        value={userInput.goal}
        onChange={(e) => updateInput({ goal: e.target.value })}
      />
    </div>
  )
}

function Step4({ userInput, updateInput }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-primary font-bold text-white mb-2">
          What's the mood of your movie?
        </h2>
        <p className="text-silver-screen">
          Choose the genre that best fits your story
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => updateInput({ mood: option.value })}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${userInput.mood === option.value
                ? 'border-cinema-gold bg-cinema-gold/10 text-white'
                : 'border-silver-screen/20 bg-velvet text-silver-screen hover:border-cinema-gold/50'}
            `}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-velvet rounded-lg border border-silver-screen/10">
        <h3 className="font-primary font-bold text-white mb-3">Your Story Summary</h3>
        <div className="space-y-2 text-sm text-silver-screen">
          <p><strong className="text-white">Name:</strong> {userInput.name}, {userInput.age}</p>
          <p><strong className="text-white">Events:</strong> {userInput.events?.length || 0} key moments</p>
          <p><strong className="text-white">Characters:</strong> {userInput.people?.length || 0} important people</p>
          <p><strong className="text-white">Mood:</strong> {MOOD_OPTIONS.find(m => m.value === userInput.mood)?.label}</p>
        </div>
      </div>
    </div>
  )
}
