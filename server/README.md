# Reference Backend — Node.js + Express + MongoDB

> ⚠️ This folder is **reference-only** code. It is **not executed** by the Lovable sandbox. The live application uses **Lovable Cloud** (Postgres + Auth + Edge Functions) for its backend, which provides the same capabilities (JWT auth, REST data access, RLS-secured persistence) without needing a Node server.
>
> Use this folder if you want to run an equivalent Node/Express/MongoDB stack on your own infrastructure.

## Structure (MVC)

```
server/
├── src/
│   ├── config/
│   │   └── db.js              # Mongo connection
│   ├── models/
│   │   ├── User.js            # mongoose user schema (bcrypt)
│   │   └── Itinerary.js       # itinerary + embedded activities
│   ├── controllers/
│   │   ├── authController.js  # signup / login (JWT)
│   │   └── itineraryController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── itineraryRoutes.js
│   └── server.js
├── .env.example
└── package.json
```

## Setup

```bash
cd server
cp .env.example .env          # fill MONGO_URI and JWT_SECRET
npm install
npm run dev
```

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | – | Create account |
| POST | /api/auth/login  | – | Returns `{ token }` |
| GET  | /api/itineraries | ✅ | List user's itineraries |
| POST | /api/itineraries | ✅ | Create |
| GET  | /api/itineraries/:id | ✅ | Read |
| PUT  | /api/itineraries/:id | ✅ | Update |
| DELETE | /api/itineraries/:id | ✅ | Delete |

Send `Authorization: Bearer <token>` on protected routes.
