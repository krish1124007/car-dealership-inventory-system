# Deployment Guide — Vercel + Render + MongoDB Atlas

The app deploys as three pieces. Vercel is perfect for the React frontend, but it runs backends as **serverless functions with an ephemeral filesystem** — our Express server needs a persistent process (image uploads are written to `public/uploads` on disk). So the recommended, free-tier-friendly split is:

| Piece | Where | Why |
|---|---|---|
| Frontend (Vite/React) | **Vercel** | Static build, instant CDN, free |
| Backend (Express) | **Render** (free web service) | Long-running Node process, disk for uploads |
| Database | **MongoDB Atlas** (free M0) | Managed MongoDB, connection string |

Total cost: ₹0.

---

## Step 1 — MongoDB Atlas (database)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Build a Database** → **M0 Free** tier.
2. Create a database user (username + password) under **Database Access**.
3. Under **Network Access** → **Add IP Address** → *Allow access from anywhere* (`0.0.0.0/0`) — Render's IPs vary.
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/car_dealership`
   (add the `/car_dealership` database name before any `?`).

## Step 2 — Backend on Render

1. Push this repo to GitHub, then at [render.com](https://render.com) → **New → Web Service** → connect the repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. **Environment variables:**

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `ADMIN_REGISTRATION_SECRET` | a long random string |
   | `CORS_ORIGIN` | your Vercel URL (add after Step 3, e.g. `https://your-app.vercel.app`) |
   | `PORT` | `3000` (Render also injects its own — the app reads `process.env.PORT` either way) |

4. Deploy. On first boot the server **auto-creates the demo admin** (`admin@cardealership.com` / `Admin@123` — override via `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` for a public deployment).
5. Optional: seed the showroom once from your machine against Atlas:
   ```bash
   cd backend
   MONGODB_URI="<atlas-uri>" npm run seed
   ```
6. Note your backend URL, e.g. `https://car-dealership-api.onrender.com`.

> **Uploads caveat:** Render's free-tier disk is ephemeral — uploaded vehicle photos are lost on redeploy/restart. Fine for a demo; for production attach a Render Persistent Disk to `backend/public/uploads`, or swap the multer storage for Cloudinary/S3.

## Step 3 — Frontend on Vercel

1. At [vercel.com](https://vercel.com) → **Add New → Project** → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - Build command `npm run build`, output `dist` (defaults are correct)
3. **Environment variable:**

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-backend>.onrender.com/api` |

4. Deploy. The included [`frontend/vercel.json`](../frontend/vercel.json) rewrites every route to `index.html` so React Router deep links (`/cars`, `/vehicles/:id`, …) work on refresh.
5. Copy your Vercel URL → go back to Render → set `CORS_ORIGIN` to it → redeploy the backend.

## Step 4 — Verify

- Open the Vercel URL → the car-loader splash, hero and seeded showroom should appear.
- Log in with the demo admin → add a car with a photo → it should appear on Home/Cars.
- Register a customer → purchase from a detail page → check **My purchases**.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Browser console shows CORS errors | `CORS_ORIGIN` on Render must exactly match the Vercel origin (scheme + host, no trailing slash) |
| `/cars` 404s on refresh | `frontend/vercel.json` missing — the SPA rewrite handles client routes |
| First request takes ~30s | Render free instances sleep when idle; the first hit wakes them |
| Empty showroom | Run the seed against the Atlas URI (Step 2.5) |
| Photos disappear after redeploy | Ephemeral disk — see the uploads caveat above |
