require('dotenv').config();

const db = require('./bd.js');
const { seedDefaults } = require('./defaults');

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.error('Usage: DATABASE_URL=your_connection_string node reset_db.js');
    process.exit(1);
}

async function reset() {
    try {
        console.log('🗑️  Dropping all tables and re-initializing...');
        await db.reset();

        console.log('🌱 Seeding default data (alphabet lesson + admin)...');
        await seedDefaults(db);

        console.log('✨ Database reset successfully! You can now start from scratch.');
    } catch (err) {
        console.error('❌ Reset failed:', err);
    } finally {
        await db.close();
    }
}

reset();
