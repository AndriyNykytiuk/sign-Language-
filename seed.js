const db = require('./bd.js');

async function seed() {
  try {
    await db.init();
    console.log('Database initialized for seeding.');

    // Check if data exists
    const lessons = await db.getAllLessonsOnly();
    if (lessons.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding data...');

    // Create Dactyl Alphabet Lesson
    const alphabetLessonId = await db.addLesson('Дактильна абетка');
    console.log(`Created lesson "Дактильна абетка" with ID: ${alphabetLessonId}`);

    // All Ukrainian alphabet letters
    const alphabet = [
      'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Є', 'Ж', 'З', 'И', 'І', 'Й',
      'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х',
      'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ю', 'Я'
    ];

    // Add all alphabet letters with video links
    for (const letter of alphabet) {
      const videoLink = `/alphabet/${letter}.mp4`;
      await db.addLessonObject(
        alphabetLessonId,
        letter,
        videoLink,
        null
      );
      console.log(`Added letter: ${letter}`);
    }

    // Create Admin User
    await db.addUser('admin', 'signLang', 'admin');
    console.log('Created admin user: admin/signLang');

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await db.close();
  }
}

seed();
