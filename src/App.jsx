import React, { useState, useEffect, useCallback } from 'react'
import Card from './components/Card'
import DropLessons from './components/DropLessons'
import Search from './components/Search'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import API_URL from './config'

function App() {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [repeatQueue, setRepeatQueue] = useState([])
  const [stepsSinceLastRepeat, setStepsSinceLastRepeat] = useState(0)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('main') // 'main', 'login', 'admin'

  // Fetch objects when a lesson is selected
  useEffect(() => {
    if (!selectedLessonId) return;

    setLoading(true);
    fetch(`${API_URL}/lessons/${selectedLessonId}/objects`)
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setCurrentIndex(0);
        setRepeatQueue([]);
        setStepsSinceLastRepeat(0);
      })
      .catch(err => console.error('Failed to fetch lesson objects:', err))


      .finally(() => setLoading(false));
  }, [selectedLessonId]);

  const handleSearchResults = useCallback((results) => {
    if (results) {
      setCards(results);
      setCurrentIndex(0);
      setRepeatQueue([]);
      setStepsSinceLastRepeat(0);
      // Optionally clear selected lesson so that if we select it again, it reloads?
      // Or just leave it. If we leave it, selecting the same lesson again won't trigger useEffect.
      // So maybe we should set it to null?
      // But if we set to null, the DropLessons might not reflect that.
      // Let's just setCards for now.
      setSelectedLessonId(null);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setView('admin');
    } else {
      setView('main');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('main');
  };

  const handleNext = (level) => {
    if (cards.length === 0) return;

    const currentItem = cards[currentIndex]
    if (level === 'не знаю') {
      setRepeatQueue(prev => [...prev, currentItem])
    }
    if (repeatQueue.length > 0 && stepsSinceLastRepeat >= 2) {
      const [nextRepeat, ...rest] = repeatQueue
      const newCards = [...cards]
      newCards.splice(currentIndex + 1, 0, nextRepeat)
      setCards(newCards)
      setRepeatQueue(rest)
      setStepsSinceLastRepeat(0)
    } else {
      setStepsSinceLastRepeat(prev => prev + 1)
    }
    setCurrentIndex(prev => (prev + 1 < cards.length ? prev + 1 : 0))
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
              <DropLessons onSelectLesson={setSelectedLessonId} />
            </div>
          </div>
          {/* Auth Buttons */}
          <div className="hidden md:flex gap-2">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setView(view === 'admin' ? 'main' : 'admin')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {view === 'admin' ? 'Головна' : 'Адмін'}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Вийти
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
            <AdminPanel />
          ) : (
            <>
              {loading ? (
                <div className="text-center text-gray-500 mt-10">Завантаження...</div>
              ) : cards.length > 0 ? (
                <div className="w-full max-w-4xl">
                  <Card
                    info={cards[currentIndex]}
                    onNext={handleNext}
                  />
                  <div className="text-center mt-6 text-sm text-gray-400">
                    Картка {currentIndex + 1} з {cards.length}
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
