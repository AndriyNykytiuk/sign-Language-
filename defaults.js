// Default data shared by seed.js, the in-memory DB and the /reset-db endpoint
const ALPHABET = [
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Є', 'Ж', 'З', 'И', 'І', 'Й',
  'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х',
  'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ю', 'Я'
];

const ALPHABET_LESSON_NAME = 'Дактильна абетка';

function getAdminPassword() {
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD is not set, using the insecure default password');
  }
  return process.env.ADMIN_PASSWORD || 'signLang';
}

// Idempotent: adds the alphabet lesson only into an empty DB and the admin only if missing
async function seedDefaults(db) {
  const lessons = await db.getAllLessonsOnly();
  if (lessons.length === 0) {
    const lessonId = await db.addLesson(ALPHABET_LESSON_NAME);
    for (const letter of ALPHABET) {
      await db.addLessonObject(lessonId, letter, `/alphabet/${letter}.mp4`, null);
    }
    console.log(`Created "${ALPHABET_LESSON_NAME}" lesson with ${ALPHABET.length} letters`);
  }

  if (!(await db.getUserByUsername('admin'))) {
    await db.addUser('admin', getAdminPassword(), 'admin');
    console.log('Created admin user');
  }
}

module.exports = { ALPHABET, ALPHABET_LESSON_NAME, getAdminPassword, seedDefaults };
