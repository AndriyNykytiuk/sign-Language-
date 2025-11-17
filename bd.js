const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.resolve(__dirname, 'data.db');
let db = null;

function open(dbFile = DB_PATH) {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(
      dbFile,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) return reject(err);
        resolve(db);
      }
    );
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

const createLessonsSQL = `
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`;

const createLessonObjectsSQL = `
  CREATE TABLE IF NOT EXISTS lesson_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    wordName TEXT NOT NULL,
    videoLink TEXT,
    pictLink TEXT,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
  );
`;

async function init() {
  await open();
  await run(createLessonsSQL);
  await run(createLessonObjectsSQL);
}

async function addLesson(name) {
  const sql = `INSERT INTO lessons (name) VALUES (?)`;
  const res = await run(sql, [name]);
  return res.lastID;
}

async function addLessonObject(lessonId, wordName, videoLink, pictLink) {
  const sql = `INSERT INTO lesson_objects (lesson_id, wordName, videoLink, pictLink) VALUES (?, ?, ?, ?)`;
  const res = await run(sql, [lessonId, wordName, videoLink, pictLink]);
  return res.lastID;
}

async function getAllLessonsWithObjects() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT l.id as lessonId, l.name, o.id as objectId, o.wordName, o.videoLink, o.pictLink
      FROM lessons l
      LEFT JOIN lesson_objects o ON l.id = o.lesson_id
      ORDER BY l.id, o.id
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function getAllLessonsOnly() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, name FROM lessons ORDER BY id`;
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function getObjectsByLessonId(lessonId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT o.id as objectId, o.wordName, o.videoLink, o.pictLink
      FROM lesson_objects o
      WHERE o.lesson_id = ?
      ORDER BY o.id
    `;
    db.all(sql, [lessonId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  init,
  addLesson,
  addLessonObject,
  getAllLessonsWithObjects,
  getAllLessonsOnly,
  getObjectsByLessonId
};
