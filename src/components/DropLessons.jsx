import React, { useEffect } from 'react'
import API_URL from '../config'

const DropLessons = ({ onSelectLesson }) => {
  const [lesson, setLesson] = React.useState('')
  const [lessons, setLessons] = React.useState([])
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  useEffect(() => {
    const ac = new AbortController()
    const fetchLessons = async () => {
      try {
        const res = await fetch(`${API_URL}/lessons-list`, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status} `)
        const data = await res.json()
        setLessons(data)

        const savedId = sessionStorage.getItem('selectedLessonId')
        if (savedId) {
          setLesson(savedId)
          onSelectLesson(savedId)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Помилка при отриманні уроків:', err)
      }
    }
    fetchLessons()
    return () => ac.abort()
  }, [onSelectLesson])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selectedId, selectedName) => {
    setLesson(selectedId)
    sessionStorage.setItem('selectedLessonId', selectedId)
    onSelectLesson(selectedId)
    setIsOpen(false)
  }

  const selectedLesson = lessons.find(l => l.id === parseInt(lesson))

  return (
    <div className="w-full" ref={dropdownRef}>

      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="block w-full pl-5 pr-10 py-4 text-left text-base text-gray-700 bg-white border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl shadow-sm transition-all duration-200 hover:border-blue-300 cursor-pointer"
        >
          <span className={selectedLesson ? 'text-gray-700' : 'text-gray-400'}>
            {selectedLesson ? selectedLesson.name : '-- Оберіть урок зі списку --'}
          </span>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg
              className={`h - 5 w - 5 transition - transform duration - 200 ${isOpen ? 'rotate-180' : ''} `}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <ul className="absolute z-100 w-full p-3 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
            {lessons.map((l) => (
              <li
                key={l.id}
                onClick={() => handleSelect(l.id, l.name)}
                className={`px - 5 mb-3 py - 3 cursor - pointer transition - colors duration - 150 first: rounded - t - 2xl last: rounded - b - 2xl ${lesson === l.id.toString()
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
                  } `}
              >
                {l.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


export default DropLessons
