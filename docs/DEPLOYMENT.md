# Deployment Guide — one Vercel project, two services

The whole app deploys as a **single Vercel project** using [Vercel Services](https://vercel.com/docs/services): the Vite frontend and the Express backend are built separately but served from one domain through one routing table. The database lives on **MongoDB Atlas** and uploaded car photos go to **Cloudinary**.

Because both halves share an origin, the frontend calls the API at the relative path `/api` — so **there is no CORS to configure** and no second project to keep in sync.

| Piece | Where |
|---|---|
| Frontend (Vite/React) | `frontend` service, serves `/` |
| Backend (Express) | `backend` service, serves `/api/*` |
| Database | MongoDB Atlas (free M0) |
| Uploaded photos | Cloudinary |

The routing table is [`vercel.json`](../vercel.json) at the repo root:

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "vite", "rewrites": [...] },
    "backend":  { "root": "backend",  "framework": "express", "entrypoint": "src/index.ts" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)",     "destination": { "service": "frontend" } }
  ]
}
```

Requests to `/api/...` reach Express with the path intact (Vercel does not strip the prefix, which is why the Express routes still mount at `/api`). Everything else goes to the SPA, whose service-level rewrite serves `index.html` so React Router deep links survive a refresh.

---

## Step 1 — MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Build a Database** → **M0 Free**.
2. Create a database user under **Database Access**.
3. Under **Network Access** → **Add IP Address** → allow `0.0.0.0/0` (Vercel's IPs vary).
4. **Connect → Drivers** → copy the connection string and add the database name before any `?`, so it ends `/car_dealership`.
5. Seed the showroom once from your machine:
   ```bash
   cd backend && MONGODB_URI="<atlas-uri>" npm run seed
   ```

## Step 2 — Create the Vercel project

1. Push the repo to GitHub, then [vercel.com](https://vercel.com) → **Add New → Project** → import it.
2. Leave the **Root Directory** as the repo root — the services in `vercel.json` point at `frontend/` and `backend/` themselves.
3. In **Settings → Build and Deployment**, set the **Framework Preset to `Services`**. A project only builds as services when this is selected *and* a `services` key exists in `vercel.json`.

> Services requires the **Services** permission on your Vercel account. If the `Services` framework preset isn't offered, your plan doesn't have it — use the two-project fallback at the bottom of this page.

## Step 3 — Storage and environment variables

1. Create a free account at [cloudinary.com](https://cloudinary.com). On the dashboard open **API Keys** and copy the **API environment variable** — it looks like `cloudinary://<api_key>:<api_secret>@<cloud_name>`. This is not optional on Vercel: `express.static()` does not serve files there and the filesystem is read-only, so disk uploads cannot work.
2. Add these environment variables:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `ADMIN_REGISTRATION_SECRET` | a long random string |
   | `CLOUDINARY_URL` | the value copied above |
   | `VITE_API_URL` | `/api` |

   Generate each secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   `CORS_ORIGIN` is not needed — frontend and backend share an origin.

3. Check the Cloudinary credentials before you rely on them. Put them in `backend/.env` and run:

   ```bash
   cd backend && npm run check:cloudinary
   ```

   It pings the account and prints the resolved cloud name, or the exact reason the credentials were rejected. The API secret is never printed.

## Step 4 — Deploy and verify

Deploy. On the first request the backend connects to Atlas and auto-creates the demo admin (`admin@cardealership.com` / `Admin@123`).

- Open the deployment URL → hero, seeded showroom and collections should render.
- Log in as the admin → add a car with several photos → they upload to Cloudinary and appear on Home/Cars.
- Register a customer → purchase from a detail page → check **My purchases**.

> **Before sharing this publicly**, set `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` to private values — otherwise anyone who reads this repo can log in as an administrator.

## How the backend runs

Vercel's Express support detects the HTTP server from the `app.listen()` call in [`backend/src/index.ts`](../backend/src/index.ts) during module startup, then routes requests to it internally (the port only matters locally). The Express app becomes a single Vercel Function on Fluid compute.

That detection is why `index.ts` starts listening immediately instead of waiting on the database: `connectDB()` runs in the background and Mongoose buffers queries until the connection is ready. Locally a failed connection still exits with a clear error; on Vercel it is logged and rethrown instead, so one bad connection doesn't kill the instance.

Nothing differs between local and deployed code — uploads pick Cloudinary or local disk based on whether `CLOUDINARY_URL` exists.

## Local development

Unchanged: `npm run dev` in `backend/` and `frontend/` as before. To exercise the real service routing locally instead, use the Vercel CLI from the repo root:

```bash
vercel dev
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build ignores `services` | Framework Preset isn't set to `Services` (Step 2.3) |
| `/api/...` returns the SPA | Rewrite order matters — the `/api/(.*)` rule must come before the catch-all |
| `/cars` 404s on refresh | The frontend service's `rewrites` entry to `/index.html` is missing |
| Image upload returns 503 | `CLOUDINARY_URL` is not set on the deployment |
| Image upload returns 502 | `CLOUDINARY_URL` is set but wrong — check the credentials in the Cloudinary dashboard |
| API 500s with a Mongo error | Check `MONGODB_URI` and that Atlas allows `0.0.0.0/0` |
| Empty showroom | Run the seed against the Atlas URI (Step 1.5) |

## Fallback: two separate projects

If your account lacks Services, deploy the halves as two Vercel projects from the same repo — one with Root Directory `frontend`, one with `backend` (the frontend keeps its own [`frontend/vercel.json`](../frontend/vercel.json) SPA rewrite). In that setup the origins differ, so you must set `VITE_API_URL` to the full backend URL and `CORS_ORIGIN` on the backend to the frontend URL. Everything else in this guide is identical.
