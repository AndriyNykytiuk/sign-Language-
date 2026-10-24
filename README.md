# SignLng — картки для вивчення жестової мови

Вебзастосунок «Жест допомоги»: уроки з картками, на кожній слово і відео жесту.
Відео можуть бути локальними файлами (`public/`), посиланнями на YouTube (звичайні відео та Shorts), Google Drive або Dropbox.

**Стек:** React 19 + Vite + Tailwind (фронтенд), Node.js + Express (бекенд), PostgreSQL (база).
Один процес `server.js` віддає і API, і зібраний фронтенд (`dist/`), і відео (`public/`).

## Розгортання на власному сервері (покроково)

Потрібно: **Docker** (рекомендовано) або **Node.js 20.19+** і **PostgreSQL 13+**.

### Крок 1. Отримати код

```bash
git clone https://github.com/AndriyNykytiuk/sign-Language-.git signlng
cd signlng
```

### Крок 2. Налаштувати змінні середовища

```bash
cp .env.example .env
openssl rand -hex 32    # результат вставити в AUTH_SECRET
```

Заповніть `.env`:

| Змінна | Обов'язкова | Опис |
|---|---|---|
| `NODE_ENV` | так | `production`. **Без неї сервер працює з тимчасовою базою в пам'яті, і дані зникають після перезапуску** |
| `DATABASE_URL` | так* | `postgresql://user:password@host:5432/dbname` (*для Docker Compose задається автоматично) |
| `ADMIN_USERNAME` | ні | логін адміна, за замовчуванням `admin` |
| `ADMIN_PASSWORD` | так | пароль адміна, мінімум 8 символів |
| `AUTH_SECRET` | так | секрет для токенів входу. Без нього адмінів розлогінює після кожного перезапуску |
| `POSTGRES_PASSWORD` | для Docker | пароль бази в контейнері PostgreSQL |
| `PORT` | ні | порт сервера, за замовчуванням `3000` |
| `APP_PORT` | ні | тільки для Docker Compose: порт на хості, за замовчуванням `3000` |
| `DB_SSL` | ні | `true` / `false`. За замовчуванням SSL вимкнено для `localhost` і увімкнено для інших хостів |

> `ADMIN_USERNAME` і `ADMIN_PASSWORD` застосовуються **тільки при першому запуску**, коли адміна ще немає.
> Щоб змінити їх пізніше, див. розділ [«Зміна логіна і пароля адміна»](#зміна-логіна-і-пароля-адміна).

`.env` не потрапляє в git і в Docker-образ.

### Крок 3. Запустити

**Варіант A: Docker Compose (застосунок + PostgreSQL)**

```bash
docker compose up -d --build
docker compose logs -f app    # має з'явитися "Server running on http://0.0.0.0:3000"
```

Таблиці, урок «Дактильна абетка» й адмін створюються автоматично. Дані бази зберігаються в томі `pgdata`.

**Варіант B: Node.js + власний PostgreSQL**

```bash
npm install --include=dev
npm run build           # збирає фронтенд у dist/
node seed.js            # таблиці + абетка + адмін; повторний запуск нічого не дублює
npm install -g pm2
pm2 start server.js --name signlng
pm2 save && pm2 startup # автозапуск після перезавантаження сервера
```

### Крок 4. Домен і HTTPS (nginx)

```nginx
server {
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d example.com
```

### Крок 5. Перевірити

1. Відкрийте сайт, оберіть урок «Дактильна абетка». Відео мають відтворюватися.
2. Натисніть «Вхід» і увійдіть з `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Має відкритися адмін-панель.

### Оновлення

```bash
git pull
docker compose up -d --build                                    # Docker
npm install --include=dev && npm run build && pm2 restart signlng   # Node.js
```

## Резервні копії бази

Усі уроки й картки зберігаються тільки в PostgreSQL, тож **без бекапів збій диска означає втрату всіх даних**.
Для цього є скрипт `backup.sh`. Він зберігає копію бази в `backups/` і видаляє копії, старші за 14 днів.

```bash
./backup.sh                      # Docker Compose (за замовчуванням)
BACKUP_MODE=node ./backup.sh     # Node.js + власний PostgreSQL (бере DATABASE_URL з .env, потрібен pg_dump)
```

Налаштування через змінні: `BACKUP_DIR` (папка, за замовчуванням `./backups`), `KEEP_DAYS` (скільки днів зберігати, за замовчуванням `14`).

### Щоденний автоматичний бекап (cron)

```bash
crontab -e
```

Додайте рядок (шлях замініть на папку проекту). Бекап щодня о 03:00:

```cron
0 3 * * * /path/to/signlng/backup.sh >> /path/to/signlng/backups/backup.log 2>&1
```

Для варіанта без Docker: `0 3 * * * BACKUP_MODE=node /path/to/signlng/backup.sh >> ...`

> Бекапи на тому ж диску не врятують, якщо зламається сам сервер.
> Періодично копіюйте папку `backups/` в інше місце: інший сервер (`rsync`), хмару (`rclone`) тощо.

### Відновлення з бекапу

**Увага:** відновлення замінює всі поточні дані в базі даними з бекапу.

```bash
# Docker Compose
docker compose exec -T db pg_restore -U signlng -d signlng --clean --if-exists < backups/signlng_2026-01-01_03-00.dump

# Node.js + власний PostgreSQL
pg_restore -d "$DATABASE_URL" --clean --if-exists backups/signlng_2026-01-01_03-00.dump
```

Після відновлення перезапустіть застосунок: `docker compose restart app` або `pm2 restart signlng`.

> `docker compose down -v` (з прапорцем `-v`) **видаляє том з базою**. Звичайні `down` / `up` / `restart` дані не чіпають.

## Зміна логіна і пароля адміна

Змінює логін і пароль наявного адміна або створює його, якщо адміна немає. Уроки й картки не змінюються.

```bash
# Docker
docker compose exec app node set_admin.js <новий_логін> <новий_пароль>

# Node.js (з папки проекту, використовує DATABASE_URL з .env)
npm run set-admin -- <новий_логін> <новий_пароль>
```

Приклад: `npm run set-admin -- olena 'MyStr0ngPass!'`. Пароль має бути не коротший за 8 символів.
Після зміни старий логін перестає працювати. Перезапускати сервер не потрібно.

Порада: щоб пароль не залишився в історії команд, поставте пробіл перед командою (працює в bash, якщо `HISTCONTROL=ignorespace`), або після зміни виконайте `history -d` для цього рядка.

## Адміністрування

- Вхід: кнопка «Вхід» на сайті.
- В адмін-панелі можна створювати уроки й додавати картки.
- Скинути базу (видаляє всі уроки й картки, відновлює дактильну абетку й адміна; скасувати не можна):
  `docker compose exec app node reset_db.js` або `npm run reset-db`.

### Відео з YouTube

У поле «Посилання на відео» вставте посилання у будь-якому форматі: `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`.
Shorts показуються вертикально, звичайні відео горизонтально.
Доступ до відео має бути «Відкрите» або «Доступ за посиланням», а вбудовування має бути дозволене.

### Як працює навчання

- **Не знаю**: слово повертається одразу після наступного.
- **Плутаюсь**: слово повертається через 4 слова.
- **Знаю**: слово йде в кінець черги.

## Локальна розробка

```bash
npm install
npm start      # бекенд на :3000 (без NODE_ENV=production — база в пам'яті)
npm run dev    # фронтенд з hot reload на :5173, API проксюється на :3000
npm run lint
```
