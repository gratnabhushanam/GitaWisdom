# Gita Wisdom V2

Full-stack scaffold using:
- Frontend: Next.js + Tailwind + Framer Motion
- Backend: Node.js + Express
- DB: SQLite (current) + Prisma
- Storage: Cloudinary (upload route included)
- Notifications: Firebase FCM + daily cron
- Auth: JWT (default) or Clerk (optional) with admin role middleware

## Structure
- apps/web: Next.js frontend
- apps/api: Express API + Prisma schema

## APIs
- GET /api/gita-mentor?type={category}
- GET /api/videos?category=kids
- GET /api/videos?type=movie
- GET /api/chapters
- GET /api/daily-sloka
- Admin-protected CRUD under /api/admin/*

## Security implemented
- Helmet headers
- Rate limiting
- Strict auth route rate limiting
- Joi validation
- JWT auth + admin-only middleware
- Optional Clerk auth mode via AUTH_PROVIDER=clerk
- Upload type+size restrictions
- Env-based secrets
- Secure admin bootstrap via ADMIN_SETUP_KEY and first-admin lock
- Production HTTPS enforcement and strict CORS origin check

## Run
1) Install deps at root:
   npm install
2) API env:
   copy apps/api/.env.example to apps/api/.env and set values
3) Prisma:
   npm run prisma:generate -w apps/api
   npm run prisma:migrate -w apps/api
   npm run prisma:seed -w apps/api
4) Start:
   npm run dev:api
   npm run dev:web

## SQLite (Current)
- Default DATABASE_URL is SQLite in [apps/api/.env.example](apps/api/.env.example): file:./dev.db
- This is simple and secure for local and early staging.

## MongoDB (Later Migration)
- Prisma supports MongoDB with a separate datasource provider and schema adjustments.
- When you are ready, create a MongoDB-specific schema and migrate data from SQLite.
- Keep APIs unchanged so frontend remains stable during DB swap.

Web: http://localhost:3001
API: http://localhost:8080

## Notes
- HTTPS should be terminated at reverse proxy in production (Nginx/Cloudflare).
- FCM works when Firebase env vars are configured.

## Admin CRUD
- Admin dashboard now supports add/edit/delete for:
   - Mentor slokas
   - Videos
   - Chapters
   - Daily slokas
- It also lists all users.
