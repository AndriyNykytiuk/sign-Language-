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

    // Create Lesson 1
 

    // Create Admin User
    await db.addUser('admin', 'admin', 'admin');
    console.log('Created admin user: admin/admin');

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

seed();
