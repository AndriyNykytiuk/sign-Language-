// Simple in-memory database for local development
let lessons = [];
let lessonObjects = [];
let users = [];
let lessonIdCounter = 1;
let objectIdCounter = 1;
let userIdCounter = 1;

async function init() {
    console.log('In-memory database initialized for local development.');
    // Lazy require: defaults.js calls back into this module
    const { seedDefaults } = require('./defaults');
    await seedDefaults(module.exports);
}

async function addLesson(name) {
    const id = lessonIdCounter++;
    lessons.push({ id, name });
    return id;
}

async function addLessonObject(lessonId, wordName, videoLink, pictLink) {
    const id = objectIdCounter++;
    lessonObjects.push({
        objectId: id,
        lesson_id: parseInt(lessonId),
        wordName,
        videoLink,
        pictLink
    });
    return id;
}

async function updateLesson(id, name) {
    const lesson = lessons.find(l => l.id === parseInt(id));
    if (!lesson) return false;
    lesson.name = name;
    return true;
}

async function deleteLesson(id) {
    const before = lessons.length;
    lessons = lessons.filter(l => l.id !== parseInt(id));
    lessonObjects = lessonObjects.filter(obj => obj.lesson_id !== parseInt(id));
    return lessons.length < before;
}

async function updateLessonObject(id, wordName, videoLink, pictLink) {
    const obj = lessonObjects.find(o => o.objectId === parseInt(id));
    if (!obj) return false;
    Object.assign(obj, { wordName, videoLink, pictLink });
    return true;
}

async function deleteLessonObject(id) {
    const before = lessonObjects.length;
    lessonObjects = lessonObjects.filter(o => o.objectId !== parseInt(id));
    return lessonObjects.length < before;
}

async function getAllLessonsWithObjects() {
    const result = [];
    lessons.forEach(lesson => {
        const objects = lessonObjects.filter(obj => obj.lesson_id === lesson.id);
        // Match the PostgreSQL LEFT JOIN: lessons without objects are returned too
        if (objects.length === 0) {
            result.push({ lessonId: lesson.id, name: lesson.name, objectId: null, wordName: null, videoLink: null, pictLink: null });
        }
        objects.forEach(obj => {
            result.push({
                lessonId: lesson.id,
                name: lesson.name,
                objectId: obj.objectId,
                wordName: obj.wordName,
                videoLink: obj.videoLink,
                pictLink: obj.pictLink
            });
        });
    });
    return result;
}

async function getAllLessonsOnly() {
    return lessons.map(l => ({ id: l.id, name: l.name }));
}

async function getObjectsByLessonId(lessonId) {
    return lessonObjects.filter(obj => obj.lesson_id === parseInt(lessonId));
}

async function searchObjects(queryStr) {
    return lessonObjects.filter(obj =>
        obj.wordName.toLowerCase().includes(queryStr.toLowerCase())
    );
}

async function addUser(username, password, role) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = userIdCounter++;
    users.push({ id, username, password: hashedPassword, role });
    return id;
}


async function updateUserPassword(id, password) {
    const bcrypt = require('bcryptjs');
    const user = users.find(u => u.id === id);
    if (user) user.password = await bcrypt.hash(password, 10);
}

async function getAdminUser() {
    return users.find(u => u.role === 'admin');
}

async function getUserByUsername(username) {
    return users.find(u => u.username === username);
}

async function close() {
    // Nothing to close for in-memory storage
}

module.exports = {
    init,
    close,
    addLesson,
    addLessonObject,
    updateLesson,
    deleteLesson,
    updateLessonObject,
    deleteLessonObject,
    getAllLessonsWithObjects,
    getAllLessonsOnly,
    getObjectsByLessonId,
    searchObjects,
    addUser,
    getUserByUsername,
    getAdminUser,
    updateUserPassword
};
