const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.resolve(__dirname, 'data.db');

let db = null;

function open(dbFile = DB_PATH) {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    db = new sqlite3.Database(
      dbFile,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) return reject(err);
        console.log('Connected to SQLite database.');
        resolve(db);
      }
    );
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
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

const createUsersSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );
`;

async function init() {
  await open();
  await run(createLessonsSQL);
  await run(createLessonObjectsSQL);
  await run(createUsersSQL);
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
  const sql = `
    SELECT l.id as lessonId, l.name, o.id as objectId, o.wordName, o.videoLink, o.pictLink
    FROM lessons l
    LEFT JOIN lesson_objects o ON l.id = o.lesson_id
    ORDER BY l.id, o.id
  `;
  return all(sql);
}

async function getAllLessonsOnly() {
  const sql = `SELECT id, name FROM lessons ORDER BY id`;
  return all(sql);
}

async function getObjectsByLessonId(lessonId) {
  const sql = `
    SELECT o.id as objectId, o.wordName, o.videoLink, o.pictLink
    FROM lesson_objects o
    WHERE o.lesson_id = ?
    ORDER BY o.id
  `;
  return all(sql, [lessonId]);
}

async function searchObjects(query) {
  const sql = `
    SELECT o.id as objectId, o.wordName, o.videoLink, o.pictLink
    FROM lesson_objects o
    WHERE o.wordName LIKE ?
    ORDER BY o.wordName
  `;
  return all(sql, [`%${query}%`]);
}

async function addUser(username, password, role) {
  const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
  const res = await run(sql, [username, password, role]);
  return res.lastID;
}

async function getUserByUsername(username) {
  const sql = `SELECT * FROM users WHERE username = ?`;
  const rows = await all(sql, [username]);
  return rows[0];
}

module.exports = {
  init,
  addLesson,
  addLessonObject,
  getAllLessonsWithObjects,
  getAllLessonsOnly,
  getObjectsByLessonId,
  searchObjects,
  addUser,
  getUserByUsername
};
