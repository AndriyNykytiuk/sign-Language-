// DropLessons.jsx
import React, { useEffect } from 'react'

const DropLessons = ({ onSelect }) => {
  const [lesson, setLesson] = React.useState('')
  const [lessons, setLessons] = React.useState([])

  useEffect(() => {
    const ac = new AbortController()
    const fetchLessons = async () => {
      try {
        const res = await fetch('/lessons-list', { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setLessons(data)

        const savedId = sessionStorage.getItem('selectedLessonId')
        if (savedId) {
          setLesson(savedId)
          onSelect(savedId) // 👈 повідомляємо App
        }
      } catch (err) {
        console.error('Помилка при отриманні уроків:', err)
      }
    }
    fetchLessons()
    return () => ac.abort()
  }, [])

  const handleChange = (e) => {
    const selectedId = e.target.value
    setLesson(selectedId)
    sessionStorage.setItem('selectedLessonId', selectedId)
    onSelect(selectedId) // 👈 повідомляємо App
  }

  return (
    <div>
      <label htmlFor="lesson-select">Оберіть урок</label>
      <select id="lesson-select" value={lesson} onChange={handleChange}>
        <option value="">Оберіть урок</option>
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>
    </div>
  )
}

export default DropLessons
