# Базовий образ
FROM node:18

# Робоча директорія
WORKDIR /app

# Копіюємо файли
COPY . .

# Встановлюємо залежності
RUN npm install

# Відкриваємо порт для API
EXPOSE 3001

# Запускаємо сервер
CMD ["node", "server.js"]
