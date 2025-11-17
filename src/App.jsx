// App.jsx
import React, { useState } from 'react'
import Card from './components/Card'
import resourses from '../Resourses.json'
import DropLessons from './components/DropLessons'

function App() {
  const [cards, setCards] = useState(resourses)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [repeatQueue, setRepeatQueue] = useState([])
  const [stepsSinceLastRepeat, setStepsSinceLastRepeat] = useState(0)
  const [selectedLessonId, setSelectedLessonId] = useState(null)

  const handleNext = (level) => {
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
    <div className="p-4">
      <DropLessons onSelect={setSelectedLessonId} />
      <Card info={cards[currentIndex]} onNext={handleNext} selectedId={selectedLessonId} />
    </div>
  )
}

export default App
