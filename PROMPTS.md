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

## Phase 5 — Design direction (my references & assets, AI executed)

I supplied the visual direction as reference screenshots and prepared all the assets myself, then iterated until it matched what I had in mind:

- "Don't use blackish colours — simple white theme, rounded corners, green/blue accents only."
- "**Here is a login-page design screenshot for reference.** I've put the background image at `public/bgms/login-bgm.png`. No Google/Facebook buttons — plain login and signup only."
- "Remove the gradient from the button and logo — flat colours; blur the card." → "No — unblur the card, blur the background image instead." → "Remove the background blur, move the card right." → "Center the card, keep only a light blur." *(four iterations until it looked right)*
- "**Reference screenshot attached**: clicking Sign Up should slide the panels — blue panel moves left and the signup form appears on the right." *(the double-slider auth card)*
- "The dashboard looks bad — sidebar layout, no emojis, proper icons, professional."
- "**Take inspiration from this landing page screenshot** *(ControlOne-style hero)*. I've placed three landing photos in `public/landing-photo` (p1–p3) and two car-logo sets in `public/car-logo/list1` and `list2`. Tabs should read Fast, Furious, and a third of your choosing." *(Claude picked "Flawless"; built the photo-tab hero with auto-scrolling logo rails)*
- "Remove the hero copy block and its button." / "Remove the watermark text behind the photo." / "The photo leaves a gap at the top — stretch it to cover perfectly." / "Speed up the moving logos."
- "After the hero, spotlight one car and point at its features. **I've stored the Creta photo at `public/cars/creata.png` — study the photo** so the callouts land on the actual features." *(numbered pulse dots on the roof rails, alloys, headlamps and grille)*
- "Make everything mobile responsive."
- "Every loader should use my car-loading animation (`public/loaders/loader1.gif`), and the site must keep showing it on first open until our images have actually loaded."

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

## Debugging prompts

- "Register from the browser says 'Failed to fetch' — both servers are running. Find the cause." *(ESM import hoisting read `CORS_ORIGIN` before dotenv loaded, so the CORS header was silently never sent)*
- "Jest fails with `Cannot use 'import.meta' outside a module` — fix the runner." *(moved Jest to native ESM mode)*
- "Mongoose keeps warning about `new: true` — clean that up." *(switched to `returnDocument: 'after'`)*

## Documentation prompts

- "Create the root README properly — here's the problem statement again, follow their required format."
- "Do we fulfil every requirement? Audit it." *(surfaced the remaining gaps before submission)*
- "Write the final PROMPTS.md — my complete prompt history with the edge cases, concise — and refresh the README in the given format."

---

## Appendix — full prompt: database design illustration

> I have the following database design model: `{{schema}}`
> Please create a professional, high-quality database design diagram suitable for technical documentation.
> Requirements: illustrate the complete schema in a clean ERD-style layout; represent each table with column name, data type, constraints and description; clearly identify all Primary Keys and Foreign Keys; draw relationship lines labelled with correct cardinality; visually distinguish each table with a modern, professional palette; include a legend; add a summary of relationships, constraints and business rules; use database-specific icons; keep spacing, alignment and typography consistent; clean white background suitable for GitHub README; the result should look like it was designed by a senior software engineer.
