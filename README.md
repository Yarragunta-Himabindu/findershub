# FindersHub

FindersHub is a campus lost-and-found app built with Vite + React.

## Real Auth Backend

This project now includes a Node.js + Express + MongoDB authentication backend in `server/index.js`.

### Required `.env` keys

```env
MONGODB_URI=...
PORT=3000
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_ORIGIN=http://localhost:8080
VITE_API_BASE_URL=http://localhost:3000
```

### Run frontend + backend

```bash
npm install
npm run dev:full
```

This starts:

- Vite app on `http://localhost:8080`
- Auth API on `http://localhost:3000`

### Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`
