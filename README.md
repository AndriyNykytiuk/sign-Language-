# SignLng — картки для вивчення жестової мови

Вебзастосунок «Жест допомоги»: уроки з картками, на кожній слово і відео жесту.
Відео можуть бути локальними файлами (`public/`), посиланнями на YouTube (звичайні відео та Shorts), Google Drive або Dropbox.

**Стек:** React 19 + Vite + Tailwind (фронтенд), Node.js + Express (бекенд), PostgreSQL (база).
Один процес `server.js` віддає і API, і зібраний фронтенд (`dist/`), і відео (`public/`).

## Розгортання на власному сервері

Потрібно: **Node.js 20.19+** і **PostgreSQL 13+**, або тільки **Docker**.

### Змінні середовища

Скопіюйте `.env.example` у `.env` і заповніть значення:

| Змінна | Обов'язкова | Опис |
|---|---|---|
| `NODE_ENV` | так | `production`. **Без неї сервер працює з тимчасовою базою в пам'яті, і дані зникають після перезапуску** |
| `DATABASE_URL` | так | `postgresql://user:password@host:5432/dbname` |
| `ADMIN_PASSWORD` | так | пароль адміна (логін `admin`). Застосовується, коли адмін створюється вперше |
| `AUTH_SECRET` | так | секрет для токенів входу: `openssl rand -hex 32`. Без нього адмінів розлогінює після кожного перезапуску |
| `PORT` | ні | порт сервера, за замовчуванням `3000` |
| `APP_PORT` | ні | тільки для Docker Compose: порт на хості, за замовчуванням `3000` |
| `DB_SSL` | ні | `true` / `false`. За замовчуванням SSL вимкнено для `localhost` і увімкнено для інших хостів |

`.env` не потрапляє в git і в Docker-образ, тож секрети передавайте окремо.

### Варіант A: Docker Compose (застосунок + PostgreSQL)

```bash
cp .env.example .env    # заповнити ADMIN_PASSWORD, AUTH_SECRET, POSTGRES_PASSWORD
docker compose up -d --build
```

Застосунок буде доступний на порту `3000` (інший порт задається через `APP_PORT` у `.env`). Дані бази зберігаються в томі `pgdata`.
Таблиці, дактильна абетка й адмін створюються автоматично при першому запуску.

### Варіант B: Node.js напряму

```bash
cp .env.example .env    # заповнити змінні, вказати DATABASE_URL на свою базу
npm install --include=dev
npm run build           # збирає фронтенд у dist/
node seed.js            # таблиці + абетка + адмін; повторний запуск нічого не дублює
node server.js
```

Щоб сервер працював у фоні й перезапускався, використайте pm2:

```bash
npm install -g pm2
pm2 start server.js --name signlng
pm2 save && pm2 startup
```

### Nginx (домен і HTTPS)

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

HTTPS можна отримати через `certbot --nginx`.

### Оновлення

```bash
git pull
npm install --include=dev && npm run build
pm2 restart signlng       # або: docker compose up -d --build
```

## Адміністрування

- Вхід: кнопка «Вхід» на сайті, логін `admin`, пароль з `ADMIN_PASSWORD`.
- В адмін-панелі можна створювати уроки, додавати картки і скидати базу.
- **Скидання бази** видаляє всі уроки й картки та відновлює дактильну абетку й адміна. Скасувати його не можна.
- Скинути базу з консолі: `npm run reset-db` (використовує `DATABASE_URL` з `.env`).

### Відео з YouTube

У поле «Посилання на відео» вставте посилання у будь-якому форматі: `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`.
Shorts показуються вертикально, звичайні відео горизонтально.
Доступ до відео має бути «Відкрите» або «Доступ за посиланням», а вбудовування має бути дозволене.

## Локальна розробка

```bash
npm install
npm start      # бекенд на :3000 (без NODE_ENV=production — база в пам'яті)
npm run dev    # фронтенд з hot reload на :5173, API проксюється на :3000
npm run lint
```
