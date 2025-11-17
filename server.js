const express = require('express');
const cors = require('cors');
const db = require('./bd.js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

db.init();

// додати урок
app.post('/lessons', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Назва уроку обов’язкова' });
  const id = await db.addLesson(name);
  res.status(201).json({ message: 'Урок додано', lesson: { id, name } });
});

// додати об’єкт до уроку
app.post('/lessons/:id/objects', async (req, res) => {
  const { wordName, videoLink, pictLink } = req.body;
  const lessonId = req.params.id;
  if (!wordName) return res.status(400).json({ error: 'wordName обов’язковий' });
  const id = await db.addLessonObject(lessonId, wordName, videoLink, pictLink);
  res.status(201).json({ message: 'Об’єкт додано', object: { id, wordName, videoLink, pictLink } });
});

// отримати всі уроки (тільки id і name для дроп-ліста)
app.get('/lessons-list', async (req, res) => {
  try {
    const lessons = await db.getAllLessonsOnly();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Помилка при отриманні уроків' });
  }
});

// отримати всі об’єкти для конкретного уроку
app.get('/lessons/:id/objects', async (req, res) => {
  const lessonId = req.params.id;
  try {
    const objects = await db.getObjectsByLessonId(lessonId);
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: 'Помилка при отриманні об’єктів' });
  }
});

// отримати всі уроки з об’єктами
app.get('/lessons', async (req, res) => {
  const lessons = await db.getAllLessonsWithObjects();
  res.json(lessons);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
