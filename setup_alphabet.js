const db = require('./bd.js');

const alphabet = [
    'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Є', 'Ж', 'З', 'И', 'І', 'Й',
    'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х',
    'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ю', 'Я'
];

async function setupAlphabet() {
    try {
        await db.init();
        console.log('Database initialized');

        // Create the lesson
        const lessonId = await db.addLesson('Дактильна абетка');
        console.log(`Created lesson "Дактильна абетка" with ID: ${lessonId}`);

        // Add all alphabet letters
        for (const letter of alphabet) {
            const videoLink = `https://drive.google.com/file/d/YOUR_GOOGLE_DRIVE_ID_FOR_${letter}/view`;
            // For now, we'll use local paths that will be served from public folder
            const localVideoPath = `/alphabet/${letter}.mp4`;

            await db.addLessonObject(
                lessonId,
                letter,
                localVideoPath,
                null // no picture link for now
            );
            console.log(`Added letter: ${letter}`);
        }

        console.log('✅ Alphabet lesson setup complete!');
        await db.close();
    } catch (err) {
        console.error('Error setting up alphabet:', err);
        process.exit(1);
    }
}

setupAlphabet();
