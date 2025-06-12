FROM node:16

# Рабочая директория внутри контейнера
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование кода проекта
COPY . .

# Важно! Явно указываем порт, который будет использовать приложение
EXPOSE 3000

# Запуск приложения
CMD ["node", "server/server.js"]