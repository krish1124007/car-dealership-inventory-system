# 🚗 Car Dealership Inventory System

A full-stack **Car Dealership Inventory System** built for the Incubyte TDD Kata. Customers can browse a showroom, search and filter cars, open a detail page for any listing and purchase it; admins manage the entire inventory (add with photo upload, edit, restock, delete) from a dedicated panel. The whole system was built **test-first** — every feature started with a failing test, visible as a red → green pattern throughout the commit history.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Tests / Test Report](#running-the-tests--test-report)
- [TDD Process](#tdd-process)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)

---

## Features

### For every user
- **Register / Login** — JWT-based authentication; the token carries the user's role and every protected route verifies it.
- **Home showroom** — all available cars as photo cards with price, category and live stock badges.
- **Search & filter** — a top search bar that finds cars by name (matches make *or* model, partial and case-insensitive) plus a filter bar with a category dropdown (derived from the actual inventory), min/max price range and one-click reset.
- **Vehicle detail page** — click **View car** on any card to see the large photo, price and spec tiles. The **Purchase** button lives here and is **disabled when stock is zero**.
- **Purchase** — an atomic stock decrement on the backend guarantees stock can never go negative, even under concurrent purchases. Every purchase is stored as an immutable record with a price snapshot.
- **My purchases** — personal purchase history, newest first, with a graceful fallback when a purchased car was later removed from the catalogue.
- **Toast notifications** — every success and error surfaces as an accessible toast (auto-dismiss + manual close).

### For admins
- **Admin registration** — gated by a shared secret (`x-admin-secret` header); public registration can never create an admin.
- **Inventory panel** — a structured form to add or edit vehicles **with photo upload** (files are stored in the backend's `public/uploads` folder and served statically), plus per-row restock and delete actions in a thumbnail table.
- **Role enforcement everywhere** — admin-only routes are protected in the UI (route guards + hidden nav) *and* on the API (403 for non-admins), so the frontend can never be bypassed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | JWT (`jsonwebtoken`), `bcrypt` password hashing |
| Validation | Zod (request bodies, query params and API responses) |
| File uploads | Multer → `backend/public/uploads`, served by `express.static` |
| Backend tests | Jest + Supertest (integration against a dedicated test database) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 |
| UI | lucide-react icons, custom toast system, responsive sidebar layout |
| Frontend tests | Vitest + React Testing Library (user-event, jsdom) |

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app: routers + central error handler
│   │   ├── index.ts             # Entry point (loads .env first, connects DB)
│   │   ├── controllers/         # auth, vehicles, uploads, admin, user
│   │   ├── middlewares/         # requireAuth (JWT) + requireAdmin (role)
│   │   ├── models/              # Mongoose schemas: User, Vehicle, Purchase
│   │   ├── routers/             # Route definitions per resource
│   │   └── utils/               # asyncHandler, response envelope, login
│   ├── tests/
│   │   ├── unit/                # Pure utility tests
│   │   ├── integration/         # Supertest suites per endpoint group
│   │   └── helpers/             # Test DB lifecycle, auth + data factories
│   ├── scripts/seed.ts          # npm run seed → 10 example cars
│   └── public/uploads/          # Uploaded vehicle photos (gitignored)
└── frontend/
    └── src/
        ├── api/                 # Typed API layer — every response zod-validated
        ├── auth/                # AuthContext (session persistence) + ProtectedRoute
        ├── components/          # Sidebar, VehicleCard, Toast, Loading, layout
        ├── pages/               # Auth slider, Home, Detail, Purchases, Admin
        └── tests/               # Vitest setup + fetch mock helper
```

---

## API Reference

Every response uses a consistent envelope: `{ statusCode, message, data }`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (always as CUSTOMER) |
| POST | `/api/auth/login` | Public | Login → JWT + user profile |
| POST | `/api/admin/register` | `x-admin-secret` header | Create an ADMIN account |
| GET | `/api/vehicles` | Authenticated | List all vehicles |
| GET | `/api/vehicles/search` | Authenticated | Search: `q`, `make`, `model`, `category`, `minPrice`, `maxPrice` |
| GET | `/api/vehicles/:id` | Authenticated | Single vehicle details |
| POST | `/api/vehicles` | **Admin** | Add a vehicle |
| PUT | `/api/vehicles/:id` | **Admin** | Update a vehicle |
| DELETE | `/api/vehicles/:id` | **Admin** | Delete a vehicle |
| POST | `/api/vehicles/:id/purchase` | Authenticated | Purchase (atomic stock decrement) |
| POST | `/api/vehicles/:id/restock` | **Admin** | Restock by a positive quantity |
| POST | `/api/uploads/vehicle-image` | **Admin** | Upload a vehicle photo (multipart) |
| GET | `/api/users/me` | Authenticated | Own profile |
| GET | `/api/users/me/purchases` | Authenticated | Own purchase history |

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (Community Server or Docker: `docker run -d -p 27017:27017 mongo`)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values (see table below)
npm run seed                # optional: loads 10 example cars with photos
npm run dev                 # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL defaults to the local backend
npm run dev                 # http://localhost:5173
```

### 3. Create your first admin

Open `http://localhost:5173/login` → click **Admin access** below the card (or visit `/admin/register`) and fill the form using the value of `ADMIN_REGISTRATION_SECRET` from `backend/.env`. You'll be logged in and land straight on the inventory panel.

Regular customers just use **Register** on the login card.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `3000` |
| `MONGODB_URI` | Mongo connection string | `mongodb://127.0.0.1:27017/car_dealership` |
| `JWT_SECRET` | Secret for signing access tokens | any strong string |
| `ADMIN_REGISTRATION_SECRET` | Shared secret required to register admins | any strong string |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

> The test suites never touch your development data — backend tests run against a separate `car_dealership_test` database that is wiped between tests.

---

## Running the Tests / Test Report

```bash
# Backend (Jest + Supertest)
cd backend
npm test                # run all suites
npm run test:coverage   # with coverage report

# Frontend (Vitest + React Testing Library)
cd frontend
npm test
```

### Latest results

| Suite | Test files | Tests | Result |
|---|---|---|---|
| Backend (unit + integration) | 11 | **97** | ✅ all passing |
| Frontend (components + pages + api) | 18 | **89** | ✅ all passing |
| **Total** | **29** | **186** | ✅ |

Backend coverage (Jest `--coverage`):

| Metric | Coverage |
|---|---|
| Statements | **97.76%** |
| Branches | **97.18%** |
| Functions | **97.77%** |
| Lines | **97.69%** |

Backend integration tests exercise the real Express app against a real MongoDB instance (no mocked database), covering authentication, role rules, validation errors, out-of-stock protection, image uploads to disk and the purchase audit trail. Frontend tests render real components with Testing Library and mock only the API module boundary.

---

## TDD Process

Every feature followed **red → green**: a commit that adds failing tests describing the contract, followed by a commit with the minimum implementation that makes them pass. You can trace pairs like these through `git log`:

```
test(frontend-api): add failing tests for api client ... (red)
feat(frontend-api): implement api client with zod validation ... (green)
test(vehicle-detail): add failing tests for the vehicle detail page (red)
feat(vehicle-detail): vehicle detail page with purchase moved off the cards (green)
```

Notable behaviours pinned by tests before implementation: registration can never self-assign the admin role, login answers 401 identically for unknown email and wrong password (no user enumeration), purchases decrement atomically and refuse at zero stock, purchase history survives vehicle deletion, and uploaded files must actually exist on disk.

---

## Screenshots

> Screenshots of the running application:

| Screen | Preview |
|---|---|
| Login / Register (sliding card) | ![Login](docs/screenshots/login.png) |
| Home showroom with search & filters | ![Home](docs/screenshots/home.png) |
| Vehicle detail with purchase | ![Detail](docs/screenshots/detail.png) |
| Admin inventory panel | ![Admin](docs/screenshots/admin.png) |
| My purchases | ![Purchases](docs/screenshots/purchases.png) |

---

## My AI Usage

### Which tools I used

- **Claude Code** (Anthropic's CLI agent, running the Claude Fable 5 model) — used throughout the project as a pair programmer.

### How I used it

- **TDD workflow**: for every module I had Claude write the failing test suite first (backend Supertest suites, frontend Testing Library specs), reviewed the contract it encoded, and then had it implement the minimum code to go green. The red/green commit pairs in the history come from this loop.
- **Boilerplate & scaffolding**: Vite + Tailwind + Vitest setup, the Express app skeleton, Mongoose schemas and the typed frontend API layer with zod validation.
- **Debugging**: Claude diagnosed several real issues — an ESM import-hoisting bug where `CORS_ORIGIN` was read before `.env` loaded (so the CORS header silently never appeared), Jest × ESM incompatibilities with the generated client, and Mongoose 9 deprecation warnings.
- **Design research**: I asked it to research professional car-dealership UI patterns on the web, then directed the design myself over several iterations (light theme, sliding auth card, sidebar layout, photo-first listing cards, detail page).
- **Verification**: after each feature Claude ran the full test suites and also drove the real app in a browser against the live backend (registering, purchasing, uploading an image) before I accepted the change.

### My reflection

AI made the TDD loop dramatically faster — writing an exhaustive failing test suite by hand is usually the part I'd be tempted to shortcut, and having the tests generated first (then reviewed by me) kept the discipline honest. The biggest lesson was that the value stays high only when I stay in the driver's seat: I rejected and redirected designs several times, asked for changes in plain language, and treated every generated test as a contract to read before implementing. AI also caught bugs I would have lost time on (the CORS/env-loading one was subtle), but it equally produced things I had to push back on — which is exactly why every commit was reviewed and test-verified before it went in. Overall it felt like pairing with a very fast junior engineer who never gets tired but always needs a code reviewer.

Per the kata's policy, every AI-assisted commit carries a `Co-Authored-By` trailer, and the complete prompt history is in [PROMPTS.md](PROMPTS.md).

---

## Deliverables checklist

- [x] Public Git repository with a red → green TDD commit history
- [x] Comprehensive README (this file)
- [x] Test report — 186 tests passing, backend coverage ~98% (see above)
- [x] Mandatory **My AI Usage** section
- [x] [PROMPTS.md](PROMPTS.md) with the AI chat history
- [ ] Screenshots in `docs/screenshots/` (see section above)
- [ ] (Optional) Live deployment
