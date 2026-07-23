# Deployment Guide — everything on Vercel

Both halves of the app deploy to **Vercel from this one repo**, as two Vercel projects with different root directories. The database lives on **MongoDB Atlas** (free tier) and uploaded car photos go to **Vercel Blob**, because Vercel functions have a read-only, ephemeral filesystem.

| Piece | Where | How |
|---|---|---|
| Frontend (Vite/React) | Vercel project #1 | Static build served from the CDN |
| Backend (Express) | Vercel project #2 | One serverless function ([`backend/api/index.ts`](../backend/api/index.ts)) |
| Database | MongoDB Atlas (free M0) | Managed MongoDB, connection string |
| Uploaded photos | Vercel Blob | Attached to the backend project |

Total cost: ₹0.

---

## Step 1 — MongoDB Atlas (database)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Build a Database** → **M0 Free** tier.
2. Create a database user (username + password) under **Database Access**.
3. Under **Network Access** → **Add IP Address** → *Allow access from anywhere* (`0.0.0.0/0`) — Vercel's function IPs vary.
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/car_dealership`
   (add the `/car_dealership` database name before any `?`).
5. Seed the showroom once from your machine against Atlas:
   ```bash
   cd backend
   MONGODB_URI="<atlas-uri>" npm run seed
   ```

## Step 2 — Backend project on Vercel

1. Push this repo to GitHub, then at [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
3. **Storage → Create Database → Blob** → attach the new Blob store to this project. This injects `BLOB_READ_WRITE_TOKEN`, which flips the upload controller from local disk to Blob automatically.
4. **Environment variables:**

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `ADMIN_REGISTRATION_SECRET` | a long random string |
   | `CORS_ORIGIN` | your frontend URL (add after Step 3, e.g. `https://your-app.vercel.app`) |

5. Deploy. Note the backend URL, e.g. `https://car-dealership-api.vercel.app`.
   - [`backend/vercel.json`](../backend/vercel.json) routes every request into the function; Express handles the `/api/...` paths exactly as it does locally.
   - On the first (cold) request the function connects to Atlas and **auto-creates the demo admin** (`admin@cardealership.com` / `Admin@123` — override via `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` for a public deployment).

## Step 3 — Frontend project on Vercel

1. **Add New → Project** → import the **same repo** again.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected; build `npm run build`, output `dist`)
3. **Environment variable:**

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-backend>.vercel.app/api` |

4. Deploy. The included [`frontend/vercel.json`](../frontend/vercel.json) rewrites every route to `index.html` so React Router deep links (`/cars`, `/vehicles/:id`, …) work on refresh.
5. Copy the frontend URL → back in the **backend** project set `CORS_ORIGIN` to it → redeploy the backend.

From now on every push to `main` redeploys both projects together.

## Step 4 — Verify

- Open the frontend URL → the car-loader splash, hero and seeded showroom should appear.
- Log in with the demo admin → add a car with photos → they upload to Blob and appear on Home/Cars.
- Register a customer → purchase from a detail page → check **My purchases**.

## How the backend runs on Vercel

Locally `src/index.ts` starts a long-lived server with `app.listen()`. On Vercel that file is never used — [`backend/api/index.ts`](../backend/api/index.ts) is the entry instead: it connects to Mongo once per cold start (cached across warm invocations), runs the default-admin bootstrap, and hands each request to the same Express `app`. No code changes are needed between the two environments; uploads pick Blob vs disk based on `BLOB_READ_WRITE_TOKEN`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Browser console shows CORS errors | `CORS_ORIGIN` on the backend project must exactly match the frontend origin (scheme + host, no trailing slash) |
| `/cars` 404s on refresh | `frontend/vercel.json` missing — the SPA rewrite handles client routes |
| API 500s with a Mongo connection error | Check `MONGODB_URI` and that Atlas Network Access allows `0.0.0.0/0` |
| Image upload returns 500 | The Blob store isn't attached — `BLOB_READ_WRITE_TOKEN` must exist on the backend project |
| Empty showroom | Run the seed against the Atlas URI (Step 1.5) |
| First request after a while is slow | Serverless cold start + fresh Mongo connection; subsequent requests are fast |

## Alternative: backend on Render

If you'd rather run the backend as a classic long-lived server (no Blob needed, disk uploads work as in dev), deploy `backend/` to a Render free web service instead: build `npm install && npm run build`, start `npm start`, same env vars minus the Blob token. Everything else in this guide stays the same.
