# BackendNest

A NestJS backend project for practicing and experimenting with modules, controllers, services, and PostgreSQL integration using Prisma ORM.

---

## 📦 Prisma Migrations

### 1. Инициализация Prisma

Если Prisma ещё не установлен:

```bash
npx prisma init
```

После этого будет создана структура:

```
prisma/
  └── schema.prisma
.env
```

---

### 2. Настройка подключения к базе данных

Открой файл `.env` и укажи строку подключения:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/your_db"
```

Пример для Docker-сети:

```env
DATABASE_URL="postgresql://postgres:postgres@my_postgres:5432/production"
```

---

### 3. Создание миграции

После изменений моделей в `prisma/schema.prisma`, создай миграцию:

```bash
npx prisma migrate dev --name init
```

`--name` — любое логическое имя миграции (`add-users`, `create-events`, и т.д.).

---

### 4. Применение миграций на сервере (production)

Для продакшена используется:

```bash
npx prisma migrate deploy
```

Эта команда применяет все готовые миграции без пересоздания схем.

---

