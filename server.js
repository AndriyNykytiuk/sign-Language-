const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./bd.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize DB and start server
(async () => {
  try {
    await db.init();
    console.log('Database initialized');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

// додати урок
app.post('/lessons', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Назва уроку обов’язкова' });
    const id = await db.addLesson(name);
    res.status(201).json({ message: 'Урок додано', lesson: { id, name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// додати об’єкт до уроку
app.post('/lessons/:id/objects', async (req, res) => {
  try {
    const { wordName, videoLink, pictLink } = req.body;
    const lessonId = req.params.id;
    if (!wordName) return res.status(400).json({ error: 'wordName обов’язковий' });
    const id = await db.addLessonObject(lessonId, wordName, videoLink, pictLink);
    res.status(201).json({ message: 'Об’єкт додано', object: { id, wordName, videoLink, pictLink } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// отримати всі уроки (тільки id і name для дроп-ліста)
app.get('/lessons-list', async (req, res) => {
  try {
    const lessons = await db.getAllLessonsOnly();
    res.json(lessons);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Помилка при отриманні об’єктів' });
  }
});

// отримати всі уроки з об’єктами
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.getAllLessonsWithObjects();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// пошук об’єктів
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await db.searchObjects(q);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при пошуку' });
  }
});

// логін
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Введіть логін і пароль' });
    }
    const user = await db.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Невірний логін або пароль' });
    }
    // Return user info (excluding password)
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
