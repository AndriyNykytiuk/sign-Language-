import React, { useEffect, useState } from 'react'
import '../css/button.css'

const Card = ({ info, onNext, selectedId }) => {
  const [isRevealed, setRevealed] = useState(false)
  const [objects, setObjects] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!selectedId) return
    const ac = new AbortController()
    const fetchData = async () => {
      try {
        const res = await fetch(`/lessons/${selectedId}/objects`, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setObjects(data)
        setCurrentIndex(0)
      } catch (err) {
        console.error('Помилка при отриманні даних:', err)
      }
    }
    fetchData()
    return () => ac.abort()
  }, [selectedId])

  const handleLevelClick = (level) => {
    setRevealed(false)
    onNext(level)

    if (!objects.length) return

    const currentObj = objects[currentIndex]
    let newObjects = [...objects]

    // видаляємо поточний об’єкт
    newObjects.splice(currentIndex, 1)

    if (level === 'знаю') {
      // додаємо в кінець
      newObjects.push(currentObj)
    } else if (level === 'плутаюсь') {
      // вставляємо через 2 елементи
      const insertIndex = Math.min(currentIndex + 2, newObjects.length)
      newObjects.splice(insertIndex, 0, currentObj)
    } else if (level === 'не знаю') {
      // вставляємо через 1 елемент
      const insertIndex = Math.min(currentIndex + 1, newObjects.length)
      newObjects.splice(insertIndex, 0, currentObj)
    }

    setObjects(newObjects)

    // рухаємося до наступного
    if (currentIndex < newObjects.length) {
      setCurrentIndex(currentIndex) // залишаємося на тій же позиції, бо там тепер новий об’єкт
    } else {
      setCurrentIndex(0)
    }
  }

  const currentObject = objects[currentIndex] || null

  return (
    <div className="text-center p-6 max-w-md mx-auto bg-gray-200 rounded-xl shadow-md space-y-4">
      {currentObject && !isRevealed ? (
        <div onClick={() => setRevealed(true)} className="cursor-pointer text-2xl text-blue-600">
          {currentObject.wordName}
          <img src={currentObject.pictLink} alt={currentObject.wordName} className="mx-auto" />
        </div>
      ) : currentObject ? (
        <video src={currentObject.videoLink} autoPlay controls width="300" className="mx-auto" />
      ) : (
        <p>Немає даних для відображення</p>
      )}

      {currentObject && isRevealed && (
        <div className="mt-4 flex gap-3 justify-center">
          <button onClick={() => handleLevelClick('знаю')} className="button">знаю</button>
          <button onClick={() => handleLevelClick('плутаюсь')} className="button">плутаюсь</button>
          <button onClick={() => handleLevelClick('не знаю')} className="button">не знаю</button>
        </div>
      )}
    </div>
  )
}

export default Card
