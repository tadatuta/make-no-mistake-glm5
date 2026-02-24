import { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  currentStep: 1,
  totalSteps: 4,
  userInput: {
    name: '',
    age: '',
    events: [],
    challenge: '',
    achievement: '',
    goal: '',
    people: [],
    mood: 'inspiring'
  },
  movieResult: null,
  isGenerating: false,
  error: null,
  regenerationsLeft: 2
}

// Action types
const ACTIONS = {
  SET_STEP: 'SET_STEP',
  UPDATE_INPUT: 'UPDATE_INPUT',
  SET_GENERATING: 'SET_GENERATING',
  SET_MOVIE_RESULT: 'SET_MOVIE_RESULT',
  SET_ERROR: 'SET_ERROR',
  REGENERATE: 'REGENERATE',
  RESET: 'RESET',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
}

// Reducer
function movieReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload }

    case ACTIONS.UPDATE_INPUT:
      return {
        ...state,
        userInput: { ...state.userInput, ...action.payload }
      }

    case ACTIONS.SET_GENERATING:
      return { ...state, isGenerating: action.payload, error: null }

    case ACTIONS.SET_MOVIE_RESULT:
      return {
        ...state,
        movieResult: action.payload,
        isGenerating: false,
        error: null
      }

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isGenerating: false }

    case ACTIONS.REGENERATE:
      if (state.regenerationsLeft <= 0) return state
      return {
        ...state,
        movieResult: {
          ...state.movieResult,
          [action.payload.type]: action.payload.value
        },
        regenerationsLeft: state.regenerationsLeft - 1
      }

    case ACTIONS.RESET:
      return { ...initialState }

    case ACTIONS.LOAD_FROM_STORAGE:
      return { ...state, ...action.payload }

    default:
      return state
  }
}

// Context
const MovieContext = createContext(null)

// Provider
export function MovieProvider({ children }) {
  const [state, dispatch] = useReducer(movieReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cinelife_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: parsed })
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    const toSave = {
      currentStep: state.currentStep,
      userInput: state.userInput,
      movieResult: state.movieResult,
      regenerationsLeft: state.regenerationsLeft
    }
    localStorage.setItem('cinelife_state', JSON.stringify(toSave))
  }, [state])

  // Actions
  const actions = {
    setStep: (step) => dispatch({ type: ACTIONS.SET_STEP, payload: step }),

    updateInput: (data) => dispatch({ type: ACTIONS.UPDATE_INPUT, payload: data }),

    setGenerating: (isGenerating) =>
      dispatch({ type: ACTIONS.SET_GENERATING, payload: isGenerating }),

    setMovieResult: (result) =>
      dispatch({ type: ACTIONS.SET_MOVIE_RESULT, payload: result }),

    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),

    regenerate: (type, value) =>
      dispatch({ type: ACTIONS.REGENERATE, payload: { type, value } }),

    reset: () => {
      localStorage.removeItem('cinelife_state')
      dispatch({ type: ACTIONS.RESET })
    }
  }

  return (
    <MovieContext.Provider value={{ state, ...actions }}>
      {children}
    </MovieContext.Provider>
  )
}

// Hook
export function useMovie() {
  const context = useContext(MovieContext)
  if (!context) {
    throw new Error('useMovie must be used within a MovieProvider')
  }
  return context
}

export default MovieContext
