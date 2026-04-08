# Gita Wisdom Deployment Clarification

## 1) Where Admin Uploaded Content Is Stored

Admin uploads should NOT be stored on the Vercel filesystem.

Reason:
- Vercel serverless instances are ephemeral.
- Local files can disappear on redeploy or scale events.

Correct approach (already supported in API):
- Upload file from admin panel to Cloudinary.
- Save only metadata and Cloudinary `secureUrl` in database.

So your storage architecture is:
- Media files: Cloudinary
- App data (titles, category, sloka, chapters, URLs): SQLite now, MongoDB later

## 2) Vercel Deployment: Frontend + Backend Recommendation

Recommended split:
- Frontend (Next.js): Vercel
- Backend API (Express): Render / Railway / Fly.io / VPS
- Media: Cloudinary
- Database: SQLite for dev only, use managed DB in production

Why split:
- Your Express API has cron jobs (daily notifications) and admin APIs better suited for persistent server runtime.
- Vercel serverless is not ideal for long-running cron and stateful server behavior.

## 3) Domain Choice: .in vs .com

Both are technically fine.

Use `.com` if:
- You want global audience and common trust perception.

Use `.in` if:
- Primary audience is India and regional identity matters.

Deployment is the same for both:
- Buy domain from registrar (GoDaddy/Namecheap/Cloudflare Registrar/etc)
- Add domain in Vercel project settings
- Add required DNS records in registrar

## 4) Secure Production Checklist

1. Set strong secrets:
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `CLERK_SECRET_KEY` (if using Clerk)

2. Lock bootstrap:
- Use `/api/register-admin` once
- Then rotate/remove `ADMIN_SETUP_KEY`

3. Restrict CORS:
- `FRONTEND_URL` must be exact production domain

4. Enforce HTTPS:
- Keep `NODE_ENV=production`
- Ensure reverse proxy/CDN sends `x-forwarded-proto=https`

5. Cloudinary hardening:
- Use signed uploads for sensitive flows
- Restrict upload presets/types/sizes

6. Database hardening:
- For production, move from SQLite to managed DB (MongoDB Atlas later)
- Backup regularly

7. Observability:
- Add request logging + admin action logging
- Enable error monitoring (Sentry)

## 5) Environment Variables by Environment

Frontend (Vercel):
- `NEXT_PUBLIC_API_BASE=https://api.yourdomain.com`
- `NEXT_PUBLIC_AUTH_PROVIDER=jwt` or `clerk`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...` (if Clerk)

Backend (Render/Railway/Fly/VPS):
- `PORT`
- `DATABASE_URL`
- `AUTH_PROVIDER`
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `CLOUDINARY_*`
- `FIREBASE_*`
- `FRONTEND_URL=https://yourdomain.com`
- `NODE_ENV=production`

## 6) Current Local Run URLs

- Frontend: http://localhost:3001
- Admin: http://localhost:3001/admin
- Backend API: http://localhost:8080
