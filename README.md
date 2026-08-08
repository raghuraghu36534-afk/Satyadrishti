# SatyaDrishti web

Landing page plus a working email/password auth flow: register, sign in,
and a protected `/dashboard`.

## Structure

```
server.js          Express app: page routes + auth API
src/auth.js         Registration, login, JWT issuing/verification
src/db.js            File-backed user store (swap for a real DB in prod)
public/index.html    Landing page (Login/Register now link to real routes)
public/login.html    /login page
public/register.html /register page
public/dashboard.html /dashboard page (protected)
public/auth.js       Shared client-side fetch logic for the three pages above
public/auth.css      Shared styling for the auth pages
data/users.json       Created automatically on first registration
```

## Run locally

```
npm install
cp .env.example .env   # then edit JWT_SECRET
npm start
```

Visit `http://localhost:3000`. Registering creates a user, immediately logs
them in, and redirects to `/dashboard`. Refreshing `/dashboard`,
`/login`, or `/register` directly in the browser works the same way it
does after a client-side navigation, because each is a real Express route
that serves its own HTML file — this isn't a single-page app relying on
JS-only routing.

## How the pieces fit together

- **Register** (`POST /api/auth/register`) hashes the password with bcrypt
  and stores `{ id, name, email, passwordHash, createdAt }` via `src/db.js`.
- **Login** (`POST /api/auth/login`) verifies the password, signs a JWT, and
  sets it as an `httpOnly` cookie — the browser sends it automatically on
  subsequent requests, and client JS never touches the token directly.
- **Dashboard** is protected two ways: the server route `GET /dashboard`
  redirects unauthenticated visitors to `/login` before any HTML is sent,
  and `public/dashboard.html` also calls `GET /api/auth/me` on load to
  populate the name/email and to catch an expired cookie mid-session.
- **Logout** (`POST /api/auth/logout`) clears the cookie.

## Moving to production

- Swap `src/db.js` for a real database (Postgres, MySQL, etc.) — every other
  file only calls `findByEmail`, `findById`, and `insertUser`, so that's the
  only file that needs to change.
- Set `NODE_ENV=production` and a long random `JWT_SECRET`. With
  `NODE_ENV=production` the auth cookie is marked `secure`, so the app must
  be served over HTTPS.
- Deploy this as a normal Node server (Render, Railway, Fly.io, a VM behind
  Nginx, etc.). Because routing lives in `server.js` rather than in static
  HTML files or a client router, `/login`, `/register`, and `/dashboard`
  resolve correctly however the app is reached — direct link, refresh, or
  in-app navigation — with no extra rewrite rules needed. If you instead
  deploy the `public/` folder to a static host with a separate serverless
  API, add rewrites there so `/login`, `/register`, and `/dashboard` still
  map to their HTML files.
