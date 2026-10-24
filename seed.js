require('dotenv').config();
const db = require('./bd.js');
const { seedDefaults } = require('./defaults');

async function seed() {
  try {
    await db.init();
    console.log('Database initialized for seeding.');

    // Adds the alphabet lesson only into an empty DB and the admin only if missing
    await seedDefaults(db);

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await db.close();
  }
}

seed();
