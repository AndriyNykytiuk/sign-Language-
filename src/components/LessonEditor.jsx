import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { getVideoLinkError } from '../utils/youtube';
import Status from './Status';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
const EMPTY_DRAFT = { wordName: '', videoLink: '', pictLink: '' };

// Admin section: rename / delete a lesson, edit / delete its words
const LessonEditor = ({ lessons, adminRequest, onDataChanged, version }) => {
    const [lessonId, setLessonId] = useState('');
    const [lessonName, setLessonName] = useState('');
    const [words, setWords] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [status, setStatus] = useState(null);

    const loadWords = useCallback(() => {
        if (!lessonId) {
            setWords([]);
            return;
        }
        fetch(`${API_URL}/lessons/${lessonId}/objects`)
            .then(res => res.json())
            .then(data => setWords(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    }, [lessonId]);

    useEffect(() => {
        loadWords();
    }, [loadWords, version]);

    const handleSelectLesson = (id) => {
        setLessonId(id);
        setLessonName(lessons.find(l => String(l.id) === id)?.name || '');
        setEditingId(null);
        setStatus(null);
    };

    // Runs an admin request and shows the result; onSuccess is called only for a 2xx response
    const run = async (request, successText, onSuccess) => {
        setStatus(null);
        try {
            const { res, data } = await request();
            if (!res.ok) {
                setStatus({ type: 'error', text: data.error || 'Помилка' });
                return;
            }
            setStatus({ type: 'success', text: successText });
            onSuccess();
            onDataChanged();
        } catch (err) {
            if (err.message === 'unauthorized') return;
            console.error(err);
            setStatus({ type: 'error', text: 'Помилка сервера' });
        }
    };

    const handleRenameLesson = (e) => {
        e.preventDefault();
        const name = lessonName.trim();
        if (!name) {
            setStatus({ type: 'error', text: 'Введіть назву уроку' });
            return;
        }
        run(() => adminRequest('PUT', `${API_URL}/lessons/${lessonId}`, { name }), 'Назву уроку збережено', () => {});
    };

    const handleDeleteLesson = () => {
        const wordsInfo = words.length ? ` і всі його слова (${words.length})` : '';
        if (!window.confirm(`Видалити урок «${lessonName}»${wordsInfo}? Цю дію не можна скасувати.`)) return;
        run(() => adminRequest('DELETE', `${API_URL}/lessons/${lessonId}`), 'Урок видалено', () => {
            setLessonId('');
            setLessonName('');
            setWords([]);
        });
    };

    const startEdit = (word) => {
        setEditingId(word.objectId);
        setDraft({ wordName: word.wordName || '', videoLink: word.videoLink || '', pictLink: word.pictLink || '' });
        setStatus(null);
    };

    const handleSaveWord = (e) => {
        e.preventDefault();
        const wordName = draft.wordName.trim();
        const videoLink = draft.videoLink.trim();
        if (!wordName) {
            setStatus({ type: 'error', text: 'Введіть слово' });
            return;
        }
        const linkError = getVideoLinkError(videoLink);
        if (linkError) {
            setStatus({ type: 'error', text: linkError });
            return;
        }
        run(
            () => adminRequest('PUT', `${API_URL}/objects/${editingId}`, { wordName, videoLink, pictLink: draft.pictLink.trim() }),
            'Слово збережено',
            () => {
                setEditingId(null);
                loadWords();
            },
        );
    };

    const handleDeleteWord = (word) => {
        if (!window.confirm(`Видалити слово «${word.wordName}»?`)) return;
        run(() => adminRequest('DELETE', `${API_URL}/objects/${word.objectId}`), 'Слово видалено', () => {
            if (editingId === word.objectId) setEditingId(null);
            loadWords();
        });
    };

    const updateDraft = (field) => (e) => setDraft(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Редагувати урок</h2>

            <Status status={status} />

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Урок</label>
                <select className={inputClass} value={lessonId} onChange={(e) => handleSelectLesson(e.target.value)}>
                    <option value="">-- Оберіть урок --</option>
                    {lessons.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            </div>

            {lessonId && (
                <>
                    <form onSubmit={handleRenameLesson} className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Назва уроку</label>
                        <div className="flex gap-2">
                            <input type="text" className={inputClass} value={lessonName} onChange={(e) => setLessonName(e.target.value)} />
                            <button type="submit" className="shrink-0 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                                Зберегти
                            </button>
                        </div>
                    </form>

                    <h3 className="text-gray-700 text-sm font-bold mb-2">Слова ({words.length})</h3>
                    {words.length === 0 ? (
                        <p className="text-gray-500 text-sm mb-6">У цьому уроці ще немає слів.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 border border-gray-200 rounded mb-6">
                            {words.map(word => (
                                <li key={word.objectId} className="p-3">
                                    {editingId === word.objectId ? (
                                        <form onSubmit={handleSaveWord} className="space-y-2">
                                            <input type="text" className={inputClass} value={draft.wordName} onChange={updateDraft('wordName')} placeholder="Слово" />
                                            <input type="text" className={inputClass} value={draft.videoLink} onChange={updateDraft('videoLink')} placeholder="Посилання на відео (https://youtu.be/...)" />
                                            <input type="text" className={inputClass} value={draft.pictLink} onChange={updateDraft('pictLink')} placeholder="Посилання на картинку (опціонально)" />
                                            <div className="flex gap-2 justify-end">
                                                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                                    Скасувати
                                                </button>
                                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                                                    Зберегти
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800">{word.wordName}</div>
                                                <div className="text-sm text-gray-500 truncate" title={word.videoLink || ''}>
                                                    {word.videoLink || 'без відео'}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => startEdit(word)} className="shrink-0 px-3 py-1.5 rounded text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                Редагувати
                                            </button>
                                            <button type="button" onClick={() => handleDeleteWord(word)} className="shrink-0 px-3 py-1.5 rounded text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors">
                                                Видалити
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <button type="button" onClick={handleDeleteLesson} className="w-full py-2 px-4 rounded border border-rose-300 text-rose-700 font-medium hover:bg-rose-50 transition-colors">
                        Видалити урок
                    </button>
                </>
            )}
        </div>
    );
};

export default LessonEditor;
