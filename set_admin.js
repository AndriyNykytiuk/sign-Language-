require('dotenv').config();
const db = require('./bd.js');
const { getAdminUsername } = require('./defaults');

// Usage: npm run set-admin -- <login> <password>
// Changes the admin login and password (or creates the admin if there is none)
const [username = getAdminUsername(), password = process.env.ADMIN_PASSWORD] = process.argv.slice(2);

async function setAdmin() {
    if (!password || password.length < 8) {
        console.error('❌ Usage: npm run set-admin -- <login> <password>  (password: at least 8 characters)');
        process.exitCode = 1;
        return;
    }

    try {
        await db.init();
        const admin = await db.getAdminUser();
        const existing = await db.getUserByUsername(username);
        if (existing && (!admin || existing.id !== admin.id)) {
            console.error(`❌ User "${username}" already exists`);
            process.exitCode = 1;
            return;
        }

        if (admin) {
            await db.updateUserCredentials(admin.id, username, password);
            console.log(`✅ Admin credentials updated. Login: ${username}`);
        } else {
            await db.addUser(username, password, 'admin');
            console.log(`✅ Admin created. Login: ${username}`);
        }
    } catch (err) {
        console.error('❌ Failed to update admin:', err);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

setAdmin();
