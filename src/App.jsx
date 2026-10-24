import React, { useState, useEffect, useCallback } from 'react'
import Card from './components/Card'
import DropLessons from './components/DropLessons'
import Search from './components/Search'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import API_URL from './config'

const AUTH_STORAGE_KEY = 'auth'

const loadAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
  } catch {
    return null
  }
}

const saveAuth = (auth) => {
  try {
    if (auth) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    else localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // storage unavailable (private mode etc.) — session just won't persist
  }
}

// How many other cards are shown before an answered card comes back
const REPEAT_AFTER = {
  'не знаю': 1,
  'плутаюсь': 4,
}

function App() {
  // Study queue: the current card is always deck[0]
  const [deck, setDeck] = useState([])
  // Ids of cards whose latest answer was "знаю"
  const [knownIds, setKnownIds] = useState(() => new Set())
  // Increments on every answer so the card remounts even when the same card comes again
  const [step, setStep] = useState(0)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(loadAuth)
  const [view, setView] = useState('main') // 'main', 'login', 'admin'
  // Bumped after admin changes so the header lesson list reloads
  const [lessonsVersion, setLessonsVersion] = useState(0)
  const handleLessonsChanged = useCallback(() => setLessonsVersion(v => v + 1), [])

  const startDeck = (newCards) => {
    setDeck(newCards);
    setKnownIds(new Set());
    setStep(prev => prev + 1);
  };

  // Fetch objects when a lesson is selected
  useEffect(() => {
    if (!selectedLessonId) return;

    setLoading(true);
    fetch(`${API_URL}/lessons/${selectedLessonId}/objects`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(startDeck)
      .catch(err => console.error('Failed to fetch lesson objects:', err))
      .finally(() => setLoading(false));
  }, [selectedLessonId]);

  const handleSearchResults = useCallback((results) => {
    if (results) {
      startDeck(results);
      // Reset so that re-selecting the same lesson triggers a reload
      setSelectedLessonId(null);
    } else {
      // Search cleared — return to the previously selected lesson
      const savedId = sessionStorage.getItem('selectedLessonId');
      if (savedId) setSelectedLessonId(savedId);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    saveAuth(userData);
    if (userData.role === 'admin') {
      setView('admin');
    } else {
      setView('main');
    }
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    saveAuth(null);
    setView('main');
  }, []);

  // "не знаю" — back right after the next card, "плутаюсь" — after 4 cards, "знаю" — to the end
  const handleNext = (level) => {
    if (deck.length === 0) return;

    const [current, ...rest] = deck
    const position = level in REPEAT_AFTER ? Math.min(REPEAT_AFTER[level], rest.length) : rest.length
    setDeck([...rest.slice(0, position), current, ...rest.slice(position)])

    setKnownIds(prev => {
      const next = new Set(prev)
      if (level === 'знаю') next.add(current.objectId)
      else next.delete(current.objectId)
      return next
    })
    setStep(prev => prev + 1)
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="mx-auto w-full bg-white shadow-sm py-4 px-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:container mx-auto max-w-7xl flex gap-3 justify-between items-center">
          <a href="#"> <img
            src="https://gesture.org.ua/images/logo.svg"
            alt="Gesture of Help Logo"
            className="h-10 md:h-12"
          /></a>
          {/* Lesson Selector */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl items-center">
            <Search onSearchResults={handleSearchResults} />
            <div className="w-full max-w-md">
              <DropLessons onSelectLesson={setSelectedLessonId} version={lessonsVersion} />
            </div>
          </div>
          {/* Auth Buttons */}
          <div className="flex gap-2">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setView(view === 'admin' ? 'main' : 'admin')}
                    className="px-4 py-2 rounded-lg font-medium border border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {view === 'admin' ? 'Головна' : 'Адмін'}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Вийти
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 rounded-lg font-medium border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Вхід
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="container mx-auto max-w-7xl px-4 py-8 flex flex-col items-center">

          {view === 'login' ? (
            <Login onLogin={handleLogin} onClose={() => setView('main')} />
          ) : view === 'admin' ? (
            <AdminPanel token={user?.token} onUnauthorized={handleLogout} onLessonsChanged={handleLessonsChanged} />
          ) : (
            <>
              {loading ? (
                <div className="text-center text-gray-500 mt-10">Завантаження...</div>
              ) : deck.length > 0 ? (
                <div className="w-full max-w-4xl">
                  <Card
                    key={step}
                    info={deck[0]}
                    onNext={handleNext}
                  />
                  <div className="text-center mt-6 text-sm text-gray-400">
                    Знаю {knownIds.size} з {deck.length}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-lg">Оберіть урок, щоб почати навчання</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Gesture of Help</p>
      </footer>
    </div>
  )
}

export default App
