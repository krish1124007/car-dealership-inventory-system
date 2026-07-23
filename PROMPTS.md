# PROMPTS.md — AI Tooling Prompt History

**Tool used:** Claude Code (Anthropic's CLI agent, Claude Fable 5 model), used as a TDD pair programmer for the whole project.

**How to read this file:** I usually prompt in Hinglish and in shorthand; below is the complete, chronological log of my prompts with the technical intent written out cleanly. My role throughout was direction and review — I set the requirements, supplied the design references and assets, rejected what I didn't like, and approved every test contract before implementation. Every AI-assisted commit carries a `Co-Authored-By` trailer.

---

## Phase 1 — Design & database

- "Here is the kata problem statement *(pasted the full TDD Kata: Car Dealership Inventory System)*. I've prepared the database design docs — create the database model code for it. We're using Postgres; dependencies are mostly installed."
- "Take my database design model and produce a professional ERD-style illustration for the docs — PK/FK markers, cardinality labels, a legend, clean white background." *(my full illustration prompt is in the appendix)*
- "Why are vehicle and purchase models not in the models folder? Keep one file per entity."
- "Switch the database from Postgres to MongoDB." *(Prisma 7 has no MongoDB support, so this meant migrating models, tests and the client to Mongoose — I accepted that trade-off knowingly)*

## Phase 2 — Backend, test-first

- "Now write the tests into a tests folder — structure it properly. Only tests for now, nothing else." *(red phase: 71 failing integration tests defined the entire API contract before a single endpoint existed; I reviewed the contract before green-lighting implementation)*
- "Now write the minimum code to convert red to green."
- "Now implement the admin functionality." *(I wanted admin creation gated by a shared secret — public registration must never be able to create an admin)*
- "Complete the user side." *(login must return the user object and role along with the token, plus a profile endpoint and purchase history)*
- "Is the backend complete? Audit it against the kata requirement by requirement."

## Phase 3 — Frontend, test-first

- "Create the frontend now. Use Vite in a `frontend` folder, keep a separate `api` folder where all endpoints live, and use zod to validate every response type. Work module by module: write the tests, commit them as `test(...)`, then implement and commit — first half of the frontend with test cases, then wire it to the backend."
- "Now complete the dashboard and the rest — showroom grid, search, purchase, admin panel — same red/green commit pattern."
- "How does a user reach the admin page from the UI? And add toaster notifications so every success and error is clearly visible."
- "In My Purchases, show each purchase properly with the vehicle's photo."

## Phase 4 — Product decisions (my calls, AI implemented)

- "This UI is not good. **Use web search** to study how professional car-dealer websites design their listing pages, then rebuild ours to that standard. The admin add-vehicle section must look like a real form, and vehicles need images."
- "No image URLs — I want real **file upload**, with images saved in the backend's `public` folder and served from there."
- "Rename Showroom to Home."
- "Drop the filter sidebar — one search bar on top that searches cars by name, and a single filter bar below it."
- "Seed some example cars so the showroom demos well." *(including one out-of-stock car so the disabled Purchase state is visible)*
- "Take Purchase off the cards. Cards get a **View Car** button that opens a detail page — everyone can view the car there, and the Purchase action lives on that page (maybe add-to-cart later)."
- "Major restructure: a top navbar with a search bar, a Cars link, and Login when logged out / an account icon when logged in. Home gets sliding banners, then the cars. The Cars page gets a filter sidebar — price range, name search, other filters — showing the full inventory."
- "Home should not dump all cars after the banner. Curate it: 'Our luxury cars collection' with those cars, then 'Most affordable cars collection', a View More button closing each collection, an invitation section pointing to the full collection, then a simple footer."
- "Show all prices in Indian rupees."
- "The price filter should be a slider from 0 to the maximum inventory price."
- "Remove the Apply button — every filter must apply automatically the moment it changes."
- "Drop the heading and subtitle from the Cars page — the filters and the grid say enough on their own."

## Phase 5 — Design direction (my references & assets, AI executed)

I supplied the visual direction as reference screenshots and prepared all the assets myself, then iterated until it matched what I had in mind:

- "Don't use blackish colours — simple white theme, rounded corners, green/blue accents only."
- "**Here is a login-page design screenshot for reference.** I've put the background image at `public/bgms/login-bgm.png`. No Google/Facebook buttons — plain login and signup only."
- "Remove the gradient from the button and logo — flat colours; blur the card." → "No — unblur the card, blur the background image instead." → "Remove the background blur, move the card right." → "Center the card, keep only a light blur." *(four iterations until it looked right)*
- "**Reference screenshot attached**: clicking Sign Up should slide the panels — blue panel moves left and the signup form appears on the right." *(the double-slider auth card)*
- "The dashboard looks bad — sidebar layout, no emojis, proper icons, professional."
- "Do a typography and visual polish pass over the whole app — consistent sizes, weights and spacing."
- "Make the banner full-screen."
- "**Take inspiration from this landing page screenshot** *(ControlOne-style hero)*. I've placed three landing photos in `public/landing-photo` (p1–p3) and two car-logo sets in `public/car-logo/list1` and `list2`. Tabs should read Fast, Furious, and a third of your choosing." *(Claude picked "Flawless"; built the photo-tab hero with auto-scrolling logo rails)*
- "Remove the hero copy block and its button." / "Remove the watermark text behind the photo." / "The photo leaves a gap at the top — stretch it to cover perfectly." / "Speed up the moving logos."
- "After the hero, spotlight one car and point at its features. **I've stored the Creta photo at `public/cars/creata.png` — study the photo** so the callouts land on the actual features." *(numbered pulse dots on the roof rails, alloys, headlamps and grille)*
- "Make everything mobile responsive."
- "Every loader should use my car-loading animation (`public/loaders/loader1.gif`), and the site must keep showing it on first open until our images have actually loaded."

## Phase 6 — Landing-page identity

Polish pass over the public pages, still red/green where behaviour changed:

- "Give the Creta spotlight colour swatches — white, brown and black — and swap the photo when I pick one."
- "The vehicle cards should look like real classifieds listings, and the View car button outlined rather than filled."
- "Polish the navbar — a premium search pill and a proper account menu."
- "Auto-create a test admin on startup and show the demo credentials in the UI, so an evaluator can log in without any setup." *(idempotent, looked up by email, credentials overridable by env)*
- "**Reference: the Arcar hero.** Rebuild the featured hero — one car centred with its name huge behind it, sliding out left while the next glides in from the right. Move the brand-logos band to after the collections."
- "Split the car and the name animations so it feels like the car is driving, not the whole slide moving."
- "The car photo is too small — make it much bigger." → "Use Bebas Neue for the car names and the brand." → "Size the car by height instead, 60vh."
- "Rework the navbar so it blends into the page at the top and turns solid on scroll, with category links and a new green logo mark." → "Bring the search bar back, between the nav links and the account area."

## Phase 7 — Catalogue features

- "Add one more category to the navbar — **Pre-launch cars**. And in the admin panel and the vehicle schema, add a type the admin can set: pre-launch or not, and electric / petrol / diesel." *(became a `fuelType` enum plus a `preLaunch` flag, exposed as admin form controls, navbar collection and server-side search filters; I had Claude write a backfill script so the existing rows got the new fields instead of silently failing the filters)*
- "One car should support **multiple images**. Show the extra photos under the main photo — clicking one swaps it into the main slot. They'd be interior shots: seats, gear and so on. Add them to the demo cars too." *(gallery strip on the detail page, multi-file upload in the admin form where the first file becomes the main photo, and three gallery photos seeded per demo car)*
- "This closing section looks very bad — make it match the rest of the website, properly." *(the flat blue 'Explore our full collection' band was rebuilt in the site's own language: light card, giant ghost lettering behind a car cutout, the same dark pill button as the hero)*

## Phase 8 — Deployment

- "We want to deploy the frontend and backend together on Vercel — is there an option in Vercel to do this properly?" *(Claude first proposed two separate Vercel projects from one repo, and flagged that image uploads and the local MongoDB would both have to move)*
- "**`vercel.json` is required to deploy projects with multiple services** *(pasted the `services` config)*." *(Claude's training predated Vercel Services and it had said no such thing existed — I gave it the config, it checked Vercel's live docs, confirmed I was right, found one schema error in what I pasted — `destination` takes only `service` and `path`, no `type` key — and rebuilt the deployment around a single project with two services. Because both halves then share an origin, CORS disappeared entirely and the frontend calls `/api` relatively)*
- "How do I actually deploy it — step by step?"
- "How do I load all the env variables at once?" *(the Import .env flow; Claude generated a ready-to-import file with fresh secrets and, while doing it, found the repo had no root `.gitignore` at all — so a secrets file would have been committed — and added one)*
- "How do I feed data into the database — from local, using the live database key?" *(seed script against Atlas; Claude verified that an inline `MONGODB_URI` really does beat the one in `backend/.env`, and gave PowerShell as well as Bash forms because the Bash syntax silently fails in PowerShell)*
- "**Use Cloudinary for the car photo uploads now.**" *(replaced Vercel Blob; Cloudinary when `CLOUDINARY_URL` is set, local disk otherwise, so local development still needs no account)*

## Phase 9 — Reporting

- "Generate the test report here, showing all the tests." *(a published report page: every one of the 224 tests as a hoverable cell, per-file grouping, live filter, backend coverage)*
- "Put the whole report in `test.md` as well." *(generated from the same run data, so the numbers cannot drift from the report page)*
- "Write PROMPTS.md properly, from the very beginning to the end." *(this file)*

## Edge cases I locked in during test review

Before each implementation I reviewed the proposed test contract and insisted these behaviours be pinned as failing tests first:

- Registering with `role: ADMIN` in the body must still create a CUSTOMER — the API must never trust a client-supplied role.
- Unknown email and wrong password must return identical 401s — no user enumeration through login errors.
- Two purchases racing for the last unit must never drive stock negative — the decrement has to be atomic. *(later confirmed live: an accidental double-fire produced two purchases and stock stopped exactly at zero)*
- Purchase history must survive the vehicle being deleted later — degrade to "vehicle no longer available", never break.
- Each purchase stores a price snapshot — later price changes must not rewrite old receipts.
- A broken image URL falls back to a placeholder, never a broken-image icon.
- Restock with `0`, a negative number, or a non-numeric value: all 400, stock untouched.
- Upload without a file / without a token / as a customer → 400 / 401 / 403; on success the file must verifiably exist on disk.
- A price slider resting at its maximum sends no price filter at all.
- `q=fort` finds the Fortuner — search is partial, case-insensitive, and matches make or model.
- Fuel type filtering is case-insensitive (`fuelType=electric` matches `ELECTRIC`), and an unknown fuel type is a 400, not a silent empty list.
- A car with one photo shows no gallery strip at all — the strip only appears when there is something to switch between.
- Vehicles created before `fuelType` and `preLaunch` existed must still parse on the frontend, so both fields are optional in the response schema.
- Missing upload configuration must never take down unrelated routes: with no storage configured the catalogue still serves, and only the upload endpoint answers — 503 when unconfigured, 502 when the provider itself rejects it.

## Debugging prompts

- "Register from the browser says 'Failed to fetch' — both servers are running. Find the cause." *(ESM import hoisting read `CORS_ORIGIN` before dotenv loaded, so the CORS header was silently never sent)*
- "Jest fails with `Cannot use 'import.meta' outside a module` — fix the runner." *(moved Jest to native ESM mode)*
- "Mongoose keeps warning about `new: true` — clean that up." *(switched to `returnDocument: 'after'`)*
- "The deployment returns `FUNCTION_INVOCATION_FAILED` — maybe something is wrong with the database connection, take a look." *(it was not the database: `bcrypt` is a native C++ module sitting in the startup import chain, and it cannot load on Vercel's runtime, so the function crashed before handling any request. Swapped to `bcryptjs`; Claude first verified that hashes created by the native library still verify under `bcryptjs`, so no existing password broke)*
- "*(pasted the runtime log)* `ENOENT: mkdir '/var/task/public/uploads'`" *(two faults: I had not attached a storage provider, and the upload module called `mkdirSync` at import time — so a missing optional config killed the entire backend. Made the directory lazy and never used on serverless)*

## Notes on how I reviewed the AI's work

Claude was wrong or imprecise several times, and these are the ones I made it prove rather than accept:

- It claimed Vercel could not deploy multiple services from one `vercel.json`. I pushed back with the actual config; it checked the live documentation, confirmed the feature exists, and corrected its own plan.
- It assumed the committed `frontend/.env` (which pins `localhost:3000`) would be harmlessly overridden on Vercel. I made it prove it: it built the bundle twice and showed the localhost string disappears entirely when the environment variable is supplied.
- Its first attempt to test the Cloudinary code path reported a failure that was actually a stale server still holding the port. It re-ran on separate ports and got the true result.
- A dark-theme colour in the generated report contained an invalid full-width character; an automated check over the CSS caught it before publishing.

## Documentation prompts

- "Create the root README properly — here's the problem statement again, follow their required format."
- "Do we fulfil every requirement? Audit it." *(surfaced the remaining gaps before submission)*
- "Write the final PROMPTS.md — my complete prompt history with the edge cases, concise — and refresh the README in the given format."
- "Write the deployment guide for the Vercel setup." *(`docs/DEPLOYMENT.md`, rewritten twice: once when we moved to Vercel Services, once when uploads moved to Cloudinary)*

---

## Appendix — full prompt: database design illustration

> I have the following database design model: `{{schema}}`
> Please create a professional, high-quality database design diagram suitable for technical documentation.
> Requirements: illustrate the complete schema in a clean ERD-style layout; represent each table with column name, data type, constraints and description; clearly identify all Primary Keys and Foreign Keys; draw relationship lines labelled with correct cardinality; visually distinguish each table with a modern, professional palette; include a legend; add a summary of relationships, constraints and business rules; use database-specific icons; keep spacing, alignment and typography consistent; clean white background suitable for GitHub README; the result should look like it was designed by a senior software engineer.

---

## Appendix — full commit trail

Every commit in the repository, oldest first (90 total). This is the ground truth behind the phases above — each red/green pair is a test contract agreed before the implementation that satisfied it.


**Phase 1 — Design & database**

- `5af7597` 2026-07-21 — Initial project setup
- `fd3c8a4` 2026-07-21 — docs : add the stating functionality of the project
- `9ac866d` 2026-07-21 — docs : complete the database design
- `61cc557` 2026-07-21 — docs : generate the database design illustration
- `a0cf05b` 2026-07-21 — Initialize the backend folder structure.
- `49d7f92` 2026-07-21 — chore: complete the development environment setup and install project dependencies
- `9295c1c` 2026-07-21 — feat: define initial database schema
- `5ec047e` 2026-07-22 — feat : complete the purchase and vechicle DB model

**Phase 2 — Backend, test-first**

- `2ae50fa` 2026-07-22 — test: add user registration test cases ( red )
- `22bdb46` 2026-07-22 — feat : update the database schema after Testing
- `4a14acb` 2026-07-22 — feat: implement auth and vehicle endpoints (green)
- `26e38d6` 2026-07-22 — feat : update the test for the admin and implemnt the basic funcality for the admin
- `0cdac24` 2026-07-22 — test : add the user test
- `4f08572` 2026-07-22 — feat : update the user functions after write test ( green )

**Phase 3 — Frontend, test-first**

- `c398ce4` 2026-07-22 — chore(frontend): scaffold vite react app with tailwind, vitest and testing library
- `bac90c3` 2026-07-22 — test(frontend-api): add failing tests for api client, zod schemas and endpoint modules (red)
- `9298c5a` 2026-07-22 — feat(frontend-api): implement api client with zod validation and all endpoint modules (green)
- `87125ae` 2026-07-22 — test(frontend-auth): add failing tests for auth context, protected route and login/register pages (red)
- `6050b36` 2026-07-22 — feat(frontend-auth): implement auth context, protected routes and login/register pages (green)
- `6024d57` 2026-07-22 — fix(backend): load .env before app module and point CORS at the vite dev server
- `5a6497a` 2026-07-22 — style(frontend-ui): switch to light theme with white cards and blue-green accents
- `fa7e7e9` 2026-07-22 — update : complete the login page design
- `730df30` 2026-07-22 — test(frontend-dashboard): add failing tests for dashboard, purchases and admin pages (red)
- `9f4f612` 2026-07-22 — feat(frontend-dashboard): implement showroom, purchases and admin pages (green)
- `7f849d8` 2026-07-22 — feat : design the images for the frontend
- `9fca566` 2026-07-22 — style(frontend-ui): professional sidebar layout with lucide icons
- `8ed259f` 2026-07-22 — style(frontend-ui): professional sidebar with lucide icons and sliding split auth card
- `694b41d` 2026-07-22 — test(frontend-admin): add failing tests for the admin registration page (red)
- `7b10047` 2026-07-22 — feat(frontend-admin): implement admin registration page wired to the admin panel (green)
- `12e794e` 2026-07-22 — test : add the test cases for the toaster notification
- `6d506bf` 2026-07-22 — feat(frontend-toast): implement toast notifications across the app (green)

**Phase 4 — Product decisions**

- `ee183f3` 2026-07-22 — test(vehicle-images): add failing tests for vehicle image urls (red)
- `6dfab4e` 2026-07-22 — feat(vehicle-images): professional listing UI with vehicle photos (green)
- `2d3b84b` 2026-07-22 — test(image-upload): add failing tests for image upload, home count and category filter (red)
- `e043aae` 2026-07-22 — feat(image-upload): local image uploads, Home page rename and filter sidebar (green)
- `aeef8ae` 2026-07-22 — test(search-bar): add failing tests for name search and horizontal filter bar (red)
- `0a50f83` 2026-07-22 — feat(search-bar): top name-search bar with a horizontal filter bar (green)
- `8f0c552` 2026-07-22 — feat(backend): add seed script with ten example vehicles
- `97e2778` 2026-07-22 — test(vehicle-detail): add failing tests for the vehicle detail page (red)
- `413a1c8` 2026-07-22 — feat(vehicle-detail): vehicle detail page with purchase moved off the cards (green)
- `faa4643` 2026-07-22 — docs: write the root README with setup, api reference, test report and My AI Usage
- `f5946fe` 2026-07-23 — test(public-layout): add failing tests for top navbar, banners and cars page (red)
- `7a89afd` 2026-07-23 — feat(public-layout): top navbar, banner carousel and cars page with filter sidebar (green)
- `db430d0` 2026-07-23 — test(purchases-ui): add failing tests for photos on purchase history entries (red)
- `125a8c1` 2026-07-23 — feat(purchases-ui): purchase history entries with vehicle photos (green)
- `52f9c59` 2026-07-23 — test(home-collections): add failing tests for curated collections, cta and footer (red)
- `817c196` 2026-07-23 — feat(home-collections): curated luxury and affordable collections with cta and footer (green)
- `4966ab4` 2026-07-23 — test(currency): expect prices in Indian rupees (red)
- `2895971` 2026-07-23 — feat(currency): show prices in Indian rupees with en-IN grouping (green)
- `ea3d67b` 2026-07-23 — test(price-slider): expect a 0-to-max price range slider on the cars page (red)
- `30aea21` 2026-07-23 — feat(price-slider): price range slider from zero to the max inventory price (green)
- `9846313` 2026-07-23 — test(auto-filters): expect cars page filters to apply automatically (red)
- `8dabfca` 2026-07-23 — feat(auto-filters): filters apply automatically on change (green)
- `8c3ee67` 2026-07-23 — style(cars-page): remove the page heading and subtitle

**Phase 5 — Design direction**

- `3203046` 2026-07-23 — style(frontend-ui): typography and visual polish pass
- `f9e4669` 2026-07-23 — style(banner): full-screen hero banner
- `d1932a0` 2026-07-23 — test(hero): expect a drive-mode hero with photo tabs (red)
- `774bc7c` 2026-07-23 — feat(hero): drive-mode landing hero with photo tabs, watermark and logo rails (green)
- `2137fd1` 2026-07-23 — style(hero): remove the hero copy block
- `6f60675` 2026-07-23 — style(hero): stretch the landing photo to cover the full hero
- `329fadd` 2026-07-23 — style(hero): drop the ghost watermark text
- `eeaa5a7` 2026-07-23 — style(hero): speed up the logo rail scroll
- `3c85647` 2026-07-23 — test(spotlight): expect a single-car feature spotlight after the hero (red)
- `65251b0` 2026-07-23 — feat(spotlight): Hyundai Creta feature spotlight after the hero (green)
- `0c31ddd` 2026-07-23 — style(responsive): mobile-friendly navbar and hero
- `06b4b6b` 2026-07-23 — docs: rewrite PROMPTS.md as the full prompt history and refresh the README
- `7e10112` 2026-07-23 — test(splash): expect a car-loader splash screen until critical images settle (red)
- `4cb8776` 2026-07-23 — feat(splash): car-loader splash screen while critical images preload (green)
- `a659b5b` 2026-07-23 — docs: sharpen PROMPTS.md around my direction, references and assets

**Phase 6 — Landing-page identity**

- `419c59c` 2026-07-23 — style(cards): classifieds-style vehicle cards with an outlined View car button
- `e780816` 2026-07-23 — style(navbar): premium search pill and account menu polish
- `0d8011e` 2026-07-23 — test(spotlight-colours): expect colour swatches on the Creta spotlight (red)
- `0cefcde` 2026-07-23 — feat(spotlight-colours): Creta colour swatches - white, brown and black (green)
- `72817a0` 2026-07-23 — test(default-admin): expect an auto-created test admin and visible demo credentials (red)
- `ff7778d` 2026-07-23 — feat(default-admin): auto-create a test admin on startup with visible demo credentials (green)
- `eaa1caf` 2026-07-23 — docs(deploy): Vercel deployment guide with SPA rewrites
- `c6c2122` 2026-07-23 — accests : add the accests
- `69093d7` 2026-07-23 — test(featured-hero): expect a sliding featured-car hero and brands section (red)
- `e7a15ca` 2026-07-23 — feat(featured-hero): Arcar-style sliding car hero with the brands band moved after collections (green)
- `eeaf629` 2026-07-23 — style(featured-hero): split car and name animations for a driving feel
- `46639ed` 2026-07-23 — style(featured-hero): larger car photo
- `04a5a8a` 2026-07-23 — style(typography): Bebas Neue for car names and the brand, even larger hero car
- `6a00be6` 2026-07-23 — style(featured-hero): height-driven car sizing at 60vh
- `2423369` 2026-07-23 — test(navbar-rework): expect a search-less blending navbar with category links (red)
- `9c7a49d` 2026-07-23 — feat(navbar-rework): blending navbar with category links and a new logo mark (green)
- `7d1d99d` 2026-07-23 — feat(navbar): search bar returns between the nav links and the account area

**Phases 7–8 — Catalogue features & deployment**

- `a7fe818` 2026-07-23 — feat: pre-launch category, fuel type, photo gallery, Vercel deploy config
- `ca92f66` 2026-07-23 — update the deployement
- `fae59fb` 2026-07-23 — fix(deploy): replace native bcrypt with bcryptjs for serverless
- `de49eb9` 2026-07-23 — fix(uploads): never touch disk on serverless, degrade gracefully without Blob

Commit mix: 32 green · 24 red · 17 style · 7 docs · 3 fix · 2 chore · 5 uncategorised.

The 24 red / 32 green split is the shape of the whole project: for every behaviour that mattered, the failing test was committed and reviewed before the code that made it pass.
