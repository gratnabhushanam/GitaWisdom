# Gita Wisdom API Documentation

This document lists all backend API endpoints, grouped by resource. Each endpoint includes its HTTP method, path, and a short description.

---

## Auth
- **POST** `/api/auth/register` — Register user
- **POST** `/api/auth/register/verify-otp` — Verify registration OTP
- **POST** `/api/auth/register/resend-otp` — Resend registration OTP
- **POST** `/api/auth/forgot-password/request-otp` — Request password reset OTP
- **POST** `/api/auth/forgot-password/verify-otp` — Verify password reset OTP
- **GET** `/api/auth/email-health` — Check email health
- **POST** `/api/auth/login` — Login user
- **GET** `/api/auth/profile` — Get user profile
- **PUT** `/api/auth/profile` — Update user profile
- **GET** `/api/auth/community` — Get community profiles
- **POST** `/api/auth/bookmarks` — Toggle bookmark
- **POST** `/api/auth/streak` — Update streak
- **GET** `/api/auth/users` — Get all users (admin)
- **DELETE** `/api/auth/users/{id}` — Delete user by admin
- **GET** `/api/auth/stats` — Get stats (admin)

## Stories
- **GET** `/api/stories` — Get stories
- **POST** `/api/stories` — Add story (admin)
- **GET** `/api/stories/kids` — Get kids stories
- **PATCH** `/api/stories/{id}` — Update story (admin)
- **DELETE** `/api/stories/{id}` — Delete story (admin)

## Videos
- **GET** `/api/videos` — Get videos
- **POST** `/api/videos` — Add video (admin)
- **GET** `/api/videos/reels` — Get reels
- **GET** `/api/videos/kids` — Get kids videos
- **GET** `/api/videos/user-reels` — Get user reels
- **POST** `/api/videos/user-reels` — Upload user reel
- **GET** `/api/videos/user-reels/me` — Get my reels
- **GET** `/api/videos/user-reels/moderation` — Get moderation queue (admin)
- **PATCH** `/api/videos/user-reels/{id}/moderate` — Moderate user reel (admin)
- **POST** `/api/videos/user-reels/{id}/like` — Like user reel
- **POST** `/api/videos/user-reels/{id}/share` — Share user reel
- **POST** `/api/videos/user-reels/{id}/comments` — Add comment to user reel
- **PATCH** `/api/videos/user-reels/{id}` — Update my reel
- **DELETE** `/api/videos/user-reels/{id}` — Delete my reel
- **DELETE** `/api/videos/{id}` — Delete video (admin)
- **POST** `/api/videos/upload/resumable` — Upload video (resumable)

## Slokas
- **GET** `/api/slokas` — Get slokas
- **POST** `/api/slokas` — Add sloka
- **GET** `/api/slokas/daily` — Get daily sloka
- **GET** `/api/slokas/daily/history` — Get daily sloka history
- **POST** `/api/slokas/daily/history` — Add daily sloka history
- **GET** `/api/slokas/mentor` — Get mentor sloka
- **GET** `/api/slokas/mentor/content` — Get mentor content
- **GET** `/api/slokas/mentor/history` — Get mentor history
- **POST** `/api/slokas/mentor/history` — Add mentor history
- **GET** `/api/slokas/{id}` — Get sloka by id

## Search
- **GET** `/api/search` — Search all

## Movies
- **GET** `/api/movies` — Get movies
- **POST** `/api/movies` — Add movie (admin)
- **DELETE** `/api/movies/{id}` — Delete movie (admin)

## Quiz
- **GET** `/api/quiz/questions` — Get quiz questions
- **POST** `/api/quiz/questions` — Add quiz question (admin)
- **DELETE** `/api/quiz/questions/{id}` — Delete quiz question (admin)

## Debug
- **GET** `/api/debug/db-status` — Get DB status (debug)

---

> For request/response details, see the Postman collection or OpenAPI spec in the backend folder.
