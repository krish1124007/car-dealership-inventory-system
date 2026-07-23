# PROMPTS.md — AI Tooling Prompt History

**Tool used:** Claude Code (Anthropic CLI agent, Claude Fable 5 model), used as a TDD pair programmer across the whole project.

This is the complete log of the prompts I wrote, in chronological order, lightly condensed and translated for readability (I often prompt in Hinglish). Every AI-assisted commit in the history carries a `Co-Authored-By` trailer.

---

## Phase 1 — Design & database

- "Here is the kata problem statement *(pasted the full TDD Kata: Car Dealership Inventory System)*. Create the database model code for this project. Create perfect code — we want to use Postgres, almost all dependencies are installed."
- "I have the following database design model — create a professional ERD-style illustration for the docs, with PK/FK markers, cardinality labels, a legend and a clean white background." *(full version of this prompt kept in the appendix below)*
- "Why not create vehicle and purchase models in the models folder too?"
- "Change the database from Postgres to MongoDB." *(Prisma 7 has no MongoDB support — Claude migrated the models, tests and client to Mongoose and flagged the trade-off)*

## Phase 2 — Backend, test-first

- "Now write the tests into a tests folder. Make the folder structure perfect — right now we just want to write tests, nothing else." *(red phase: 71 failing integration tests defined the whole API contract before a single endpoint existed)*
- "Now write the minimum code to convert red to green in testing."
- "Now implement the admin functionality." *(secret-gated admin registration — public register must never create an admin)*
- "Complete the user side." *(login returns the user + role, profile endpoint, purchase history)*
- "Is the backend complete?" *(requirement-by-requirement audit before moving on)*

## Phase 3 — Frontend, test-first

- "Now create the frontend. Use Vite in a frontend folder, keep a separate `api` folder where we add all the endpoints, and use zod for type validation. Work module by module: write tests, commit like `test(...): add test`, then implement and commit — create the first half of the frontend with test cases, then wire it to the backend."
- "Now complete the dashboard and the rest." *(showroom grid, search, purchase, admin panel — red commit, then green commit)*
- "How do I access the admin page in the frontend? Also add toaster notifications so every error and success shows properly."
- "In My Purchases, show the purchases perfectly with the photo."

## Phase 4 — Product decisions & UX iterations

- "This UI is not good. Research how professional car dealer websites look — use web search — and make everything clean and perfect. The admin add-vehicle form looks weird, it should be a proper form, and vehicles should have images."
- "I don't want an image URL — I want image upload, with the images saved locally in the backend's public folder. Also rename Showroom to Home."
- "Don't use a filter sidebar for search — put one search bar on top that searches cars by name, and below it one bar with all the filters."
- "Add some example cars." *(idempotent seed script, verified photo URLs, one out-of-stock car to demo the disabled purchase state)*
- "Remove Purchase from the card — keep a View Car button that opens a detail page where everyone can see the car; keep purchase there (add-to-cart maybe later)."
- "Major frontend change: top navbar (search bar, Cars link, Login when logged out / account icon when logged in), sliding banners below it, then the cars. Clicking Cars opens a page with a filter sidebar (price range, name search, other filters) showing all cars."
- "After the banner don't show all cars. Show 'our luxury cars collection' then those cars, 'most affordable cars collection' then those cars, a View More button at the end of every collection, closing text inviting people to visit the collections, and a simple footer."
- "Show prices in Indian rupees."
- "On the cars page, show the price range as a slider from 0 to the max price."
- "I don't want an Apply button — any filter I touch should apply automatically."

## Phase 5 — Visual design iterations

- "Don't use blackish colours — use a simple white theme with some rounding and green/blue accents."
- "Login page: use the background image at `public/bgms/login-bgm.png`, no Google/Facebook login — simple login and signup only."
- "Remove the gradient from the login button and logo — simple colours; and blur the card." → "Actually remove the card blur and blur the background image instead." → "Remove the background blur and move the card right." → "Center the card and keep just a light blur." *(four quick iterations to land the final look)*
- "Make the login page like this screenshot — clicking Sign Up should rotate the page: the blue panel slides left and the signup form appears on the right." *(double-slider auth card)*
- "This dashboard is bad — use a sidebar, no emojis, icons only, make it professional." *(later replaced by the public top-navbar layout)*
- "Take inspiration from this landing page screenshot. Three landing photos are in `public/landing-photo` (p1–p3) and car logos in `public/car-logo/list1` and `list2`. Buttons: Fast, Furious, and a third of your choice." *(drive-mode hero with photo tabs and auto-scrolling logo rails — Claude picked "Flawless")*
- "Remove the hero text block and its button." / "Remove the watermark name behind the photo." / "The photo leaves space at the top — stretch it to cover perfectly." / "Increase the speed of the moving icons."
- "After the landing hero, add a section showing one car and point out its features. I stored the Creta photo at `public/cars/creata.png` — study the photo." *(spotlight with numbered pulse dots placed on the actual features)*
- "Also make it mobile responsive."

## Edge-case prompts (the ones that shaped the tests)

Each of these became a failing (red) test before any code was written:

- "What if someone registers with `role: ADMIN` in the body? Public registration must never create an admin."
- "Login with an unknown email and with a wrong password should look identical — the API must not leak which emails exist."
- "What happens when two people buy the last car at the same time? Stock must never go negative." *(atomic `findOneAndUpdate` guarded by `quantity > 0` — later proven live when an automated double-click produced two purchases and stock stopped exactly at zero)*
- "If an admin deletes a car someone already bought, their purchase history must survive — show 'vehicle no longer available' instead of breaking."
- "The purchase must snapshot the price — if the admin raises the price later, my old receipt must not change."
- "What if a vehicle's image URL is broken? Fall back to a placeholder, never a broken-image icon."
- "Restock with zero, negative or `'many'` as the quantity — all must be 400s and must not touch the stock."
- "Upload without a file, without a token, or as a customer — 400/401/403; and on success the file must actually exist on disk."
- "If the price slider stays at the max, don't send a price filter at all."
- "Search with `q=fort` should find the Fortuner — partial, case-insensitive, matching make or model."

## Debugging prompts

- "Register from the browser says 'Failed to fetch' — backend and frontend are both running. Find it." *(root cause: ESM import hoisting read `CORS_ORIGIN` before dotenv loaded, so the CORS header was silently never sent)*
- "Jest is failing with `Cannot use 'import.meta' outside a module`." *(moved Jest to native ESM mode)*
- "Mongoose is printing deprecation warnings about `new: true`." *(switched to `returnDocument: 'after'`)*

## Documentation prompts

- "Create the root README properly — here is the problem statement again, follow their required format."
- "Tell me — do we fulfil all of these requirements?" *(compliance audit that surfaced the remaining gaps)*
- "Now write the perfect PROMPTS.md — good, short prompts including the edge cases — and update the README in their given format." *(this file)*

---

## Appendix — full prompt: database design illustration

> I have the following database design model: `{{schema}}`
> Please create a professional, high-quality database design diagram suitable for technical documentation.
> Requirements: illustrate the complete schema in a clean ERD-style layout; represent each table with column name, data type, constraints and description; clearly identify all Primary Keys and Foreign Keys; draw relationship lines labelled with correct cardinality; visually distinguish each table with a modern, professional palette; include a legend; add a summary of relationships, constraints and business rules; use database-specific icons; keep spacing, alignment and typography consistent; clean white background suitable for GitHub README; the result should look like it was designed by a senior software engineer.
