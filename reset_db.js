const { Pool } = require('pg');
const db = require('./bd.js');

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.error('Usage: DATABASE_URL=your_connection_string node reset_db.js');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function reset() {
    try {
        console.log('🗑️  Dropping all tables...');
        await pool.query('DROP TABLE IF EXISTS lesson_objects, lessons, users CASCADE');
        console.log('✅ Tables dropped.');

        console.log('🔄 Re-initializing database structure...');
        // bd.js will use the same DATABASE_URL from env
        await db.init();

        console.log('👤 Creating default admin user (admin/signLang)...');
        await db.addUser('admin', 'signLang', 'admin');

        console.log('✨ Database reset successfully! You can now start from scratch.');
    } catch (err) {
        console.error('❌ Reset failed:', err);
    } finally {
        await pool.end();
        await db.close();
    }
}

reset();
