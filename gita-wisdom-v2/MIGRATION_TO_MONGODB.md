# Migration Plan: SQLite to MongoDB

## Current State
- App uses Prisma with SQLite (`provider = "sqlite"`).
- APIs and frontend are database-agnostic.

## Migration Steps
1. Create a new Prisma schema for MongoDB (e.g. `prisma/schema.mongodb.prisma`) with:
   - `datasource db { provider = "mongodb" url = env("DATABASE_URL") }`
   - `@db.ObjectId` mappings for id/reference fields where needed.
2. Set `DATABASE_URL` to your MongoDB connection string.
3. Run:
   - `npm run prisma:generate -w apps/api`
4. Write and run a one-time migration script:
   - Read current SQLite data via Prisma client (SQLite schema)
   - Insert into MongoDB via Prisma client (MongoDB schema)
5. Switch API runtime to MongoDB schema.
6. Verify APIs:
   - `/api/gita-mentor`
   - `/api/videos`
   - `/api/chapters`
   - `/api/daily-sloka`
   - `/api/admin/*`

## Security Checklist During Migration
- Keep JWT/Clerk verification logic unchanged.
- Rotate `JWT_SECRET` and database credentials after cutover.
- Restrict MongoDB network access and enable authentication/TLS.
- Remove old SQLite file after successful verification.
