# SubStack RU

Российская платформа для независимых авторов — публикуйте email-рассылки и зарабатывайте на платных подписках.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)

## Возможности

- **Редактор статей** — TipTap с Markdown, форматированием, изображениями и кодом
- **Email-рассылка** — автоматическая отправка через Resend при публикации
- **Платные подписки** — CloudPayments (Mir, СБП), комиссия 10%
- **Paywall** — серверная проверка доступа, teaser + gradient для платного контента
- **Аналитика** — подписчики, доходы, открытия писем, клики
- **SEO** — SSR, dynamic sitemap, JSON-LD, meta tags для Яндекса
- **CSV-экспорт** — скачивание списка подписчиков

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind v4 |
| Backend | Next.js API Routes, NextAuth v4 (JWT) |
| База данных | PostgreSQL 16, Prisma ORM |
| Редактор | TipTap (rich text → JSON + HTML) |
| Email | Resend SDK |
| Платежи | CloudPayments, YooKassa (planned) |

## Быстрый старт (Docker)

```bash
git clone https://github.com/djd1m/2026-PU-APR-LESSON-04-SUBSTACK-Simple.git
cd 2026-PU-APR-LESSON-04-SUBSTACK-Simple
docker compose up -d --build
```

Приложение будет доступно на `http://localhost:3001`, PostgreSQL на порту `5436`.

### Тестовые данные

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/substackru" npx tsx prisma/seed.ts
```

Тестовый автор: `author@example.com` / `password123`

## Локальная разработка (без Docker)

```bash
# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env.local
# Отредактируйте .env.local: DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY

# База данных
npm run db:migrate
npm run db:generate
npm run db:seed

# Запуск
npm run dev
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (0.0.0.0:3000) |
| `npm run build` | Production-сборка |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:generate` | Prisma generate |
| `npm run db:seed` | Seed тестовых данных |
| `npm run db:studio` | Prisma Studio |

## Переменные окружения

| Переменная | Обязательна | Описание |
|-----------|:-----------:|----------|
| `DATABASE_URL` | да | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | да | Секрет для JWT-токенов |
| `NEXTAUTH_URL` | да | Внешний URL приложения |
| `RESEND_API_KEY` | да | API-ключ Resend для email |
| `EMAIL_FROM` | нет | Адрес отправителя (default: onboarding@resend.dev) |
| `NEXT_PUBLIC_APP_URL` | да | Публичный URL (для ссылок в email, sitemap) |
| `CLOUDPAYMENTS_PUBLIC_ID` | нет | CloudPayments Public ID |
| `CLOUDPAYMENTS_API_SECRET` | нет | CloudPayments API Secret |

## Архитектура

```
src/
├── app/
│   ├── (auth)/          # Login, register, verify-email
│   ├── (public)/        # SSR: [slug]/, [slug]/[postSlug]/, explore/
│   ├── (dashboard)/     # Панель автора: посты, подписчики, настройки
│   └── api/             # REST API: posts, publications, subscribers, payments, analytics
├── components/
│   ├── editor/          # TipTap редактор + тулбар
│   ├── layout/          # Header, Footer, Sidebar
│   ├── posts/           # PostCard, PaywallBlock
│   └── subscribe/       # SubscribeWidget
└── lib/
    ├── auth.ts          # NextAuth config
    ├── prisma.ts        # Prisma singleton
    ├── email/           # Resend client, шаблоны
    ├── payments/        # CloudPayments
    ├── validators.ts    # Zod-схемы
    └── utils.ts         # slugify, formatRubles, formatDate
```

### Модели данных (Prisma)

`User` → `Publication` → `Post` → `EmailSend`
`User` → `Subscription` → `Payment`
`Publication` → `Subscriber`

## Docker

| Сервис | Порт | Описание |
|--------|:----:|----------|
| `app` | 3001 | Next.js (standalone) |
| `db` | 5436 | PostgreSQL 16 |

Миграции запускаются автоматически при старте контейнера (`docker-entrypoint.sh`).

## Лицензия

MIT
