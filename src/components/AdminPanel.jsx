import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState('');
    const [wordName, setWordName] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [pictLink, setPictLink] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [newLessonName, setNewLessonName] = useState('');

    const fetchLessons = () => {
        fetch('http://localhost:3000/lessons-list')
            .then(res => res.json())
            .then(data => setLessons(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!selectedLesson) {
            setError('Оберіть урок');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/lessons/${selectedLesson}/objects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wordName, videoLink, pictLink }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Картку успішно додано!');
                setWordName('');
                setVideoLink('');
                setPictLink('');
            } else {
                setError(data.error || 'Помилка при додаванні');
            }
        } catch (err) {
            console.error(err);
            setError('Помилка сервера');
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!newLessonName.trim()) {
            setError('Введіть назву уроку');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newLessonName }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Урок успішно створено!');
                setNewLessonName('');
                fetchLessons(); // Reload lessons list
            } else {
                setError(data.error || 'Помилка при створенні уроку');
            }
        } catch (err) {
            console.error(err);
            setError('Помилка сервера');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 mt-8">
            {/* Create Lesson Section */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Створити новий урок</h2>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleCreateLesson}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Назва уроку</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newLessonName}
                            onChange={(e) => setNewLessonName(e.target.value)}
                            placeholder="Наприклад: Базові слова"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Створити урок
                    </button>
                </form>
            </div>

            {/* Add Card Section */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Додати картку до уроку</h2>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Урок</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedLesson}
                            onChange={(e) => setSelectedLesson(e.target.value)}
                        >
                            <option value="">-- Оберіть урок --</option>
                            {lessons.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Слово (Назва)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={wordName}
                            onChange={(e) => setWordName(e.target.value)}
                            placeholder="Наприклад: Привіт"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Посилання на відео</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Посилання на картинку (опціонально)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={pictLink}
                            onChange={(e) => setPictLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                    >
                        Додати картку
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminPanel;
