# VelvetSkin

Сайт салону воскової депіляції **VelvetSkin** (Запоріжжя): багатомовний лендінг (uk / ru / en), онлайн-запис, квіз, відгуки та внутрішня CRM-адмінка.

- **Production:** [https://www.velvetskinzp.com](https://www.velvetskinzp.com)
- **Стек:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS v4, next-intl, MongoDB (Mongoose), Groq AI, Cloudflare Turnstile, Telegram Bot API, Vercel Analytics

---

## Швидкий старт

```bash
git clone <repo-url>
cd velvet-skin
npm install
cp .env.example .env.local
# заповніть змінні в .env.local
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

| Команда        | Опис                          |
|----------------|-------------------------------|
| `npm run dev`  | Dev-сервер                    |
| `npm run build`| Production build              |
| `npm run start`| Запуск зібраного застосунку   |
| `npm run lint` | ESLint                        |

---

## Змінні середовища

Скопіюйте `.env.example` → `.env.local` і заповніть:

| Змінна | Обовʼязкова | Опис |
|--------|-------------|------|
| `MONGODB_URI` | так | Connection string MongoDB |
| `ADMIN_PASSWORD` | так | Пароль входу в `/admin` |
| `ADMIN_SESSION_SECRET` | ні | Окремий секрет для підпису cookie (інакше використовується `ADMIN_PASSWORD`) |
| `TELEGRAM_BOT_TOKEN` | для нотифікацій | Токен Telegram-бота |
| `TELEGRAM_CHAT_ID` | для нотифікацій | Chat ID для сповіщень |
| `TURNSTILE_SECRET_KEY` | для запису | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ні | Site key (є дефолт у коді) |
| `GROQ_API_KEY` | ні | AI-резюме заявок з квізу |

На **Vercel** додайте ті самі змінні в Project Settings → Environment Variables.

---

## Адмінка (CRM)

1. Відкрийте `/admin` (або `/ru/admin`, `/en/admin`).
2. Увійдіть паролем з `ADMIN_PASSWORD`.
3. Вкладки: заявки (квіз / запис), база клієнтів, модерація відгуків.
4. Кнопка **Вийти** скидає HTTP-only cookie сесії.

Сесія: підписаний cookie `vs_admin_session` (7 днів). Без валідної сесії middleware повертає `401` для `/api/admin/*` та `/api/clients`.

---

## API

### Публічні

| Метод | Шлях | Опис |
|-------|------|------|
| `POST` | `/api/leads` | Заявка (запис / квіз). Zod + rate limit. Captcha обовʼязкова для типу `Запис з кнопки` |
| `GET` | `/api/reviews` | Лише схвалені відгуки |
| `POST` | `/api/reviews` | Новий відгук (на модерацію) + Telegram |
| `POST` | `/api/auth/login` | Вхід в адмінку |
| `POST` | `/api/auth/logout` | Вихід |

### Захищені (потрібна admin-сесія)

| Метод | Шлях | Опис |
|-------|------|------|
| `GET/PATCH/DELETE` | `/api/admin/leads` | CRM заявок |
| `GET/POST/PATCH/DELETE` | `/api/admin/clients` | База клієнтів |
| `GET/PATCH/DELETE` | `/api/admin/reviews` | Модерація відгуків |
| `*` | `/api/clients` | Alias на `/api/admin/clients` (також під auth) |

Rate limit — in-memory по IP (best-effort на serverless; для жорсткого ліміту можна додати Upstash).

---

## Структура проєкту

```
src/
  app/
    [locale]/          # Лендінг + admin (+ login)
    api/               # Public і admin API
  components/
    admin/             # CRM UI
    layout/            # Header, Footer, providers
    sections/          # Hero, About, Services, Gallery, Reviews, FAQ, Contacts
    ui/                # BookingModal, QuizModal, FloatingBookingButton
  lib/                 # auth, mongodb, validation (Zod), api-helpers, locales, reviews, groq
  messages/            # uk.json, ru.json, en.json
  models/              # Lead, Client, Review (Mongoose)
public/
  img/                 # Статичні зображення та відео (див. нижче)
```

Локалі централізовані в `src/lib/locales.ts`. За замовчуванням `uk` без префікса (`localePrefix: 'as-needed'`).

---

## Статичні ассети (`public/`)

У репозиторії може бути лише частина файлів. Для повної верстки потрібні:

| Шлях | Призначення |
|------|-------------|
| `public/og-preview.png` | Open Graph (1200×630) |
| `public/img/hero-poster.webp` | Poster hero |
| `public/img/hero-video.webm` | Hero-відео |
| `public/img/aftor.jpg` | About |
| `public/img/sert.webp` | Сертифікат |
| `public/img/man-price.jpg` / `woman-price.jpg` | Прайс |
| `public/img/map-placeholder-large.avif` | Плейсхолдер карти |
| `public/img/gallery/res-1.webp` … `res-12.webp` | Галерея |
| `public/img/favicon.svg` | Favicon |

Без цих файлів `next/image` покаже помилки 404 на відповідних секціях.

---

## Deploy checklist (не зламати прод)

Перед деплоєм обовʼязково:

1. На Vercel додати **`ADMIN_PASSWORD`** (без цього `/admin` і CRM API недоступні). Якщо пароля ще немає в env — CRM після деплою відкриє login і нічого не віддасть без нього.
2. Перевірити `TURNSTILE_SECRET_KEY`, `MONGODB_URI`, Telegram.
3. **Не** тримати пароль у `NEXT_PUBLIC_*` — такі змінні можуть потрапити в браузер. Використовуйте лише серверний `ADMIN_PASSWORD`.
4. Після деплою перевірити:
   - головна `/` відкривається
   - форма запису (`#booking-modal`) створює заявку
   - квіз з About створює заявку
   - `/admin` → login → список лідів / клієнтів / відгуків
   - Telegram-нотифікації приходять

Публічний `POST /api/admin/leads` залишено для зворотної сумісності зі старими вкладками браузера; новий фронт бʼє в `/api/leads`.

---

## Примітки

- React Compiler увімкнено (`experimental.reactCompiler`).
- AI-резюме заявок через Groq (`src/lib/groq.ts`); без ключа — текстовий fallback.
- Legacy `/api/quiz` і `/api/telegram` видалені — використовуйте `/api/leads`.
