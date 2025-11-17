const db = require('./bd');

async function seed() {
  await db.init();

  await db.addItem({
    field1: 'Гаряче',
    field2: '/video/hot.mov',
    field3: 'абетка'
  });

  await db.addItem({
    field1: 'самокат',
    field2: '/video/samokat.mov',
    field3: 'абетка'
  });

  await db.addItem({
    field1: 'велосипед',
    field2: '/video/bikecyckle.mov',
    field3: 'абетка'
  });

  console.log('✅ Дані успішно додано');
  await db.close();
}

seed();
