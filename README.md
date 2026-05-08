# Issue Tracking and Ticketing System

Full-stack issue tracking system with role-based access (`admin`, `support`, `user`), ticket creation, comments, status/priority workflows, and a React dashboard with filters/sorting.

## Tech

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- Frontend: React (Vite)

## Roles

- **admin**: manage users, view all tickets
- **support**: view all tickets, update status/priority, comment
- **user**: create tickets, view own tickets, comment on own tickets

## Project structure

- `server/`: Express API + MongoDB models + seed script
- `client/`: React UI

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Update `server/.env` (a placeholder file is included). You can use `server/.env.example` as reference.

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN` (usually `http://localhost:5173`)
- `PORT` (optional)

### 3) Start MongoDB

Run a local MongoDB instance or use MongoDB Atlas.

### 4) Seed sample data

```bash
npm run seed
```

Seeding creates sample users and tickets across statuses/priorities.

### 5) Run the app

```bash
npm run dev
```

- API: `http://localhost:4000`
- UI: `http://localhost:5173`

## Seeded accounts

After seeding:

- **admin**: `admin@demo.com` / `Password123!`
- **support**: `support@demo.com` / `Password123!`
- **user**: `user@demo.com` / `Password123!`

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets/:id/comments`
- `PATCH /api/tickets/:id` (support/admin)
- `GET /api/users` (admin)
- `PATCH /api/users/:id/role` (admin)

## Deploy backend on Render

Render will run the Express server as a normal web service.

1. Create a new **Web Service** (or import `render.yaml`).
2. Build command: `npm install`
3. Start command: `npm --workspace server run start`
4. Set environment variables:
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (any strong secret string)
- `CLIENT_ORIGIN` (your deployed frontend URL, like `https://your-app.onrender.com` or `https://your-app.vercel.app`)
   - `PORT` (optional)

Health check endpoint: `GET /api/health`

Note: MongoDB connection happens right after the server starts; the first few seconds may take time on cold start.

After deploy, run `npm run seed` once locally (or create a one-off Render job) to create demo data.

