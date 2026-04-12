# Gita Wisdom API Documentation (Detailed)

This document lists all backend API endpoints, including HTTP method, path, description, path params, body params, and authorization requirements.

---

## Auth
- **POST** `/api/auth/register` — Register user
  - **Body:** `{ "name": string, "email": string, "password": string }`
  - **Authorization:** None
- **POST** `/api/auth/register/verify-otp` — Verify registration OTP
  - **Body:** `{ "email": string, "otp": string }`
  - **Authorization:** None
- **POST** `/api/auth/register/resend-otp` — Resend registration OTP
  - **Body:** `{ "email": string }`
  - **Authorization:** None
- **POST** `/api/auth/forgot-password/request-otp` — Request password reset OTP
  - **Body:** `{ "email": string }`
  - **Authorization:** None
- **POST** `/api/auth/forgot-password/verify-otp` — Verify password reset OTP
  - **Body:** `{ "email": string, "otp": string, "newPassword": string }`
  - **Authorization:** None
- **GET** `/api/auth/email-health` — Check email health
  - **Authorization:** None
- **POST** `/api/auth/login` — Login user
  - **Body:** `{ "email": string, "password": string }`
  - **Authorization:** None
- **GET** `/api/auth/profile` — Get user profile
  - **Authorization:** Bearer Token
- **PUT** `/api/auth/profile` — Update user profile
  - **Body:** `{ "name"?: string, "bio"?: string, ... }`
  - **Authorization:** Bearer Token
- **GET** `/api/auth/community` — Get community profiles
  - **Authorization:** Bearer Token
- **POST** `/api/auth/bookmarks` — Toggle bookmark
  - **Body:** `{ "itemId": string, "type": string }`
  - **Authorization:** Bearer Token
- **POST** `/api/auth/streak` — Update streak
  - **Body:** `{ "date": string }`
  - **Authorization:** Bearer Token
- **GET** `/api/auth/users` — Get all users (admin)
  - **Authorization:** Bearer Token (admin)
- **DELETE** `/api/auth/users/{id}` — Delete user by admin
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token (admin)
- **GET** `/api/auth/stats` — Get stats (admin)
  - **Authorization:** Bearer Token (admin)

## Stories
- **GET** `/api/stories` — Get stories
  - **Authorization:** None
- **POST** `/api/stories` — Add story (admin)
  - **Body:** `{ "title": string, "content": string, ... }`
  - **Authorization:** Bearer Token (admin)
- **GET** `/api/stories/kids` — Get kids stories
  - **Authorization:** None
- **PATCH** `/api/stories/{id}` — Update story (admin)
  - **Params:** `id` (string)
  - **Body:** `{ ... }`
  - **Authorization:** Bearer Token (admin)
- **DELETE** `/api/stories/{id}` — Delete story (admin)
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token (admin)

## Videos
- **GET** `/api/videos` — Get videos
  - **Authorization:** None
- **POST** `/api/videos` — Add video (admin)
  - **Body:** `{ "title": string, "url": string, ... }`
  - **Authorization:** Bearer Token (admin)
- **GET** `/api/videos/reels` — Get reels
  - **Authorization:** None
- **GET** `/api/videos/kids` — Get kids videos
  - **Authorization:** None
- **GET** `/api/videos/user-reels` — Get user reels
  - **Authorization:** Bearer Token
- **POST** `/api/videos/user-reels` — Upload user reel
  - **Body:** `multipart/form-data` (video file, metadata)
  - **Authorization:** Bearer Token
- **GET** `/api/videos/user-reels/me` — Get my reels
  - **Authorization:** Bearer Token
- **GET** `/api/videos/user-reels/moderation` — Get moderation queue (admin)
  - **Authorization:** Bearer Token (admin)
- **PATCH** `/api/videos/user-reels/{id}/moderate` — Moderate user reel (admin)
  - **Params:** `id` (string)
  - **Body:** `{ "status": string }`
  - **Authorization:** Bearer Token (admin)
- **POST** `/api/videos/user-reels/{id}/like` — Like user reel
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token
- **POST** `/api/videos/user-reels/{id}/share` — Share user reel
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token
- **POST** `/api/videos/user-reels/{id}/comments` — Add comment to user reel
  - **Params:** `id` (string)
  - **Body:** `{ "comment": string }`
  - **Authorization:** Bearer Token
- **PATCH** `/api/videos/user-reels/{id}` — Update my reel
  - **Params:** `id` (string)
  - **Body:** `multipart/form-data` (video file, metadata)
  - **Authorization:** Bearer Token
- **DELETE** `/api/videos/user-reels/{id}` — Delete my reel
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token
- **DELETE** `/api/videos/{id}` — Delete video (admin)
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token (admin)
- **POST** `/api/videos/upload/resumable` — Upload video (resumable)
  - **Body:** `multipart/form-data` (video file, chunk info)
  - **Authorization:** Bearer Token

## Slokas
- **GET** `/api/slokas` — Get slokas
  - **Authorization:** None
- **POST** `/api/slokas` — Add sloka
  - **Body:** `{ "text": string, ... }`
  - **Authorization:** None
- **GET** `/api/slokas/daily` — Get daily sloka
  - **Authorization:** API Key
- **GET** `/api/slokas/daily/history` — Get daily sloka history
  - **Authorization:** API Key
- **POST** `/api/slokas/daily/history` — Add daily sloka history
  - **Body:** `{ ... }`
  - **Authorization:** API Key
- **GET** `/api/slokas/mentor` — Get mentor sloka
  - **Authorization:** API Key
- **GET** `/api/slokas/mentor/content` — Get mentor content
  - **Authorization:** API Key
- **GET** `/api/slokas/mentor/history` — Get mentor history
  - **Authorization:** API Key
- **POST** `/api/slokas/mentor/history` — Add mentor history
  - **Body:** `{ ... }`
  - **Authorization:** API Key
- **GET** `/api/slokas/{id}` — Get sloka by id
  - **Params:** `id` (string)
  - **Authorization:** None

## Search
- **GET** `/api/search` — Search all
  - **Query:** `q` (string)
  - **Authorization:** None

## Movies
- **GET** `/api/movies` — Get movies
  - **Authorization:** None
- **POST** `/api/movies` — Add movie (admin)
  - **Body:** `{ "title": string, ... }`
  - **Authorization:** Bearer Token (admin)
- **DELETE** `/api/movies/{id}` — Delete movie (admin)
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token (admin)

## Quiz
- **GET** `/api/quiz/questions` — Get quiz questions
  - **Authorization:** None
- **POST** `/api/quiz/questions` — Add quiz question (admin)
  - **Body:** `{ "question": string, ... }`
  - **Authorization:** Bearer Token (admin)
- **DELETE** `/api/quiz/questions/{id}` — Delete quiz question (admin)
  - **Params:** `id` (string)
  - **Authorization:** Bearer Token (admin)

## Debug
- **GET** `/api/debug/db-status` — Get DB status (debug)
  - **Authorization:** None

---

> For request/response details, see the Postman collection or OpenAPI spec in the backend folder.
