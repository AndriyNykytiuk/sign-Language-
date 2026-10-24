import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { getYouTubeId, isYouTubeUrl } from '../utils/youtube';

const Status = ({ status }) => {
    if (!status) return null;
    const style = status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    return <div className={`${style} p-3 rounded mb-4`}>{status.text}</div>;
};

const AdminPanel = ({ token, onUnauthorized, onLessonsChanged }) => {
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState('');
    const [wordName, setWordName] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [pictLink, setPictLink] = useState('');
    const [newLessonName, setNewLessonName] = useState('');
    const [lessonStatus, setLessonStatus] = useState(null);
    const [cardStatus, setCardStatus] = useState(null);
    const [resetStatus, setResetStatus] = useState(null);

    // POST with the admin token; logs out if the token is missing or expired
    const adminPost = async (url, body) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        if (res.status === 401) {
            onUnauthorized();
            throw new Error('unauthorized');
        }
        const data = await res.json();
        return { res, data };
    };

    const fetchLessons = () => {
        fetch(`${API_URL}/lessons-list`)
            .then(res => res.json())
            .then(data => setLessons(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCardStatus(null);

        if (!selectedLesson) {
            setCardStatus({ type: 'error', text: 'Оберіть урок' });
            return;
        }

        const link = videoLink.trim();
        if (isYouTubeUrl(link) && !getYouTubeId(link)) {
            setCardStatus({ type: 'error', text: 'Не вдалося розпізнати посилання YouTube. Скопіюйте посилання на конкретне відео.' });
            return;
        }

        try {
            const { res, data } = await adminPost(`${API_URL}/lessons/${selectedLesson}/objects`, { wordName, videoLink: link, pictLink });
            if (res.ok) {
                setCardStatus({ type: 'success', text: 'Картку успішно додано!' });
                setWordName('');
                setVideoLink('');
                setPictLink('');
            } else {
                setCardStatus({ type: 'error', text: data.error || 'Помилка при додаванні' });
            }
        } catch (err) {
            if (err.message === 'unauthorized') return;
            console.error(err);
            setCardStatus({ type: 'error', text: 'Помилка сервера' });
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setLessonStatus(null);

        if (!newLessonName.trim()) {
            setLessonStatus({ type: 'error', text: 'Введіть назву уроку' });
            return;
        }

        try {
            const { res, data } = await adminPost(`${API_URL}/lessons`, { name: newLessonName.trim() });
            if (res.ok) {
                setLessonStatus({ type: 'success', text: 'Урок успішно створено!' });
                setNewLessonName('');
                fetchLessons(); // Reload lessons list
                onLessonsChanged();
            } else {
                setLessonStatus({ type: 'error', text: data.error || 'Помилка при створенні уроку' });
            }
        } catch (err) {
            if (err.message === 'unauthorized') return;
            console.error(err);
            setLessonStatus({ type: 'error', text: 'Помилка сервера' });
        }
    };

    const handleResetDb = async () => {
        if (!window.confirm('Видалити ВСІ уроки та картки і відновити початкові дані? Цю дію не можна скасувати.')) return;
        setResetStatus(null);

        try {
            const { res, data } = await adminPost(`${API_URL}/reset-db`, {});
            if (res.ok) {
                setResetStatus({ type: 'success', text: data.message || 'Базу даних скинуто' });
                setSelectedLesson('');
                fetchLessons();
                onLessonsChanged();
            } else {
                setResetStatus({ type: 'error', text: data.error || 'Помилка при скиданні бази' });
            }
        } catch (err) {
            if (err.message === 'unauthorized') return;
            console.error(err);
            setResetStatus({ type: 'error', text: 'Помилка сервера' });
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 mt-8">
            {/* Create Lesson Section */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Створити новий урок</h2>

                <Status status={lessonStatus} />

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

                <Status status={cardStatus} />

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
                            placeholder="https://youtu.be/..."
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

            {/* Reset DB Section */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Скинути базу даних</h2>
                <p className="text-sm text-gray-500 mb-6">Видаляє всі уроки й картки та відновлює дактильну абетку і адміна.</p>

                <Status status={resetStatus} />

                <button
                    type="button"
                    onClick={handleResetDb}
                    className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-200"
                >
                    Скинути базу
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
