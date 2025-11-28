const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// Use DATABASE_URL in production, or fallback to local config if needed
// For local dev without a real PG DB, this might fail unless user provides a local string.
// We will assume DATABASE_URL is provided or we default to a local postgres url.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/signlng';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  return pool.query(text, params);
}

const createLessonsSQL = `
  CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );
`;

const createLessonObjectsSQL = `
  CREATE TABLE IF NOT EXISTS lesson_objects (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    wordName TEXT NOT NULL,
    videoLink TEXT,
    pictLink TEXT
  );
`;

const createUsersSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );
`;

async function init() {
  try {
    await query(createLessonsSQL);
    await query(createLessonObjectsSQL);
    await query(createUsersSQL);
    console.log('PostgreSQL tables initialized.');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

async function addLesson(name) {
  const sql = `INSERT INTO lessons (name) VALUES ($1) RETURNING id`;
  const res = await query(sql, [name]);
  return res.rows[0].id;
}

async function addLessonObject(lessonId, wordName, videoLink, pictLink) {
  const sql = `INSERT INTO lesson_objects (lesson_id, wordName, videoLink, pictLink) VALUES ($1, $2, $3, $4) RETURNING id`;
  const res = await query(sql, [lessonId, wordName, videoLink, pictLink]);
  return res.rows[0].id;
}

async function getAllLessonsWithObjects() {
  const sql = `
    SELECT l.id as "lessonId", l.name, o.id as "objectId", o.wordName, o."videoLink", o."pictLink"
    FROM lessons l
    LEFT JOIN lesson_objects o ON l.id = o.lesson_id
    ORDER BY l.id, o.id
  `;
  const res = await query(sql);
  // Map snake_case or whatever PG returns to camelCase if needed, 
  // but here we aliased columns in SQL to match expected JS object structure roughly.
  // PG returns lowercase column names usually unless quoted.
  // We quoted aliases above to preserve camelCase.
  return res.rows;
}

async function getAllLessonsOnly() {
  const sql = `SELECT id, name FROM lessons ORDER BY id`;
  const res = await query(sql);
  return res.rows;
}

async function getObjectsByLessonId(lessonId) {
  const sql = `
    SELECT o.id as "objectId", o.wordName, o."videoLink", o."pictLink"
    FROM lesson_objects o
    WHERE o.lesson_id = $1
    ORDER BY o.id
  `;
  const res = await query(sql, [lessonId]);
  return res.rows;
}

async function searchObjects(queryStr) {
  const sql = `
    SELECT o.id as "objectId", o.wordName, o."videoLink", o."pictLink"
    FROM lesson_objects o
    WHERE o.wordName ILIKE $1
    ORDER BY o.wordName
  `;
  // ILIKE is case-insensitive in Postgres
  const res = await query(sql, [`%${queryStr}%`]);
  return res.rows;
}

async function addUser(username, password, role) {
  const sql = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id`;
  const res = await query(sql, [username, password, role]);
  return res.rows[0].id;
}

async function getUserByUsername(username) {
  const sql = `SELECT * FROM users WHERE username = $1`;
  const res = await query(sql, [username]);
  return res.rows[0];
}

async function close() {
  await pool.end();
}

module.exports = {
  init,
  close,
  addLesson,
  addLessonObject,
  getAllLessonsWithObjects,
  getAllLessonsOnly,
  getObjectsByLessonId,
  searchObjects,
  addUser,
  getUserByUsername
};
