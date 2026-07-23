# Test Report — Car Dealership Inventory System

**224 of 224 tests passing** · 0 failed · 0 skipped

Generated 2026-07-23 from a full run of both suites.

## Summary

| Suite | Runner | Files | Tests | Passed | Failed | Duration |
|---|---|---:|---:|---:|---:|---:|
| Backend | Jest + Supertest | 12 | 103 | 103 | 0 | 10.0s |
| Frontend | Vitest + Testing Library | 20 | 121 | 121 | 0 | 28.5s |
| **Total** | | **32** | **224** | **224** | **0** | **38.6s** |

## Coverage — backend

| Metric | Covered | Total | Percent |
|---|---:|---:|---:|
| Statements | 405 | 432 | 93.75% |
| Branches | 92 | 113 | 81.41% |
| Functions | 53 | 57 | 92.98% |
| Lines | 376 | 402 | 93.53% |

> Frontend coverage is not reported — no coverage provider (`@vitest/coverage-v8`) is installed for Vitest in this project.

## How to run

```bash
cd backend && npm test
```

```bash
cd frontend && npx vitest run
```

## Backend — 103 tests in 12 files

### `tests/integration/vehicles.crud.test.ts`

27/27 passing · 2.1s

**Vehicle CRUD GET /api/vehicles**

- ✅ allows browsing the list without a token _(62ms)_
- ✅ returns all vehicles for an authenticated customer _(33ms)_
- ✅ returns an empty list when there is no inventory _(15ms)_

**Vehicle CRUD POST /api/vehicles**

- ✅ rejects unauthenticated requests with 401 _(26ms)_
- ✅ rejects customers with 403 (admin-only) _(19ms)_
- ✅ lets an admin add a vehicle and persists it _(20ms)_
- ✅ stores an optional image url with the vehicle _(16ms)_
- ✅ stores extra gallery images with the vehicle _(25ms)_
- ✅ rejects a body missing make with 400 _(19ms)_
- ✅ rejects a body missing model with 400 _(11ms)_
- ✅ rejects a body missing category with 400 _(10ms)_
- ✅ rejects a body missing price with 400 _(11ms)_
- ✅ rejects a negative price with 400 _(13ms)_
- ✅ rejects a zero price with 400 _(15ms)_
- ✅ rejects a negative quantity with 400 _(13ms)_

**Vehicle CRUD GET /api/vehicles/:id**

- ✅ allows viewing a vehicle without a token _(11ms)_
- ✅ returns the vehicle details for any authenticated user _(11ms)_
- ✅ returns 404 for a vehicle that does not exist _(10ms)_

**Vehicle CRUD PUT /api/vehicles/:id**

- ✅ rejects unauthenticated requests with 401 _(8ms)_
- ✅ rejects customers with 403 (admin-only) _(15ms)_
- ✅ lets an admin update vehicle details _(18ms)_
- ✅ returns 404 for a vehicle that does not exist _(10ms)_
- ✅ rejects an invalid update (negative price) with 400 _(10ms)_

**Vehicle CRUD DELETE /api/vehicles/:id**

- ✅ rejects unauthenticated requests with 401 _(6ms)_
- ✅ rejects customers with 403 (admin-only) _(13ms)_
- ✅ lets an admin delete a vehicle _(15ms)_
- ✅ returns 404 for a vehicle that does not exist _(11ms)_

### `tests/integration/auth.register.test.ts`

9/9 passing · 1.3s

**POST /api/auth/register**

- ✅ creates a user and returns 201 with the public profile _(116ms)_
- ✅ never returns the password hash in the response _(83ms)_
- ✅ stores the password as a bcrypt hash, not plaintext _(154ms)_
- ✅ registers new users as CUSTOMER, never ADMIN _(80ms)_
- ✅ rejects a duplicate email with 409 _(87ms)_
- ✅ rejects a body missing name with 400 _(9ms)_
- ✅ rejects a body missing email with 400 _(7ms)_
- ✅ rejects a body missing password with 400 _(10ms)_
- ✅ rejects an invalid email format with 400 _(5ms)_

### `tests/integration/admin.register.test.ts`

9/9 passing · 1.1s

**POST /api/admin/register**

- ✅ creates an ADMIN user when the registration secret is correct _(109ms)_
- ✅ never returns the password hash in the response _(77ms)_
- ✅ rejects the request with 403 when the secret header is missing _(6ms)_
- ✅ rejects the request with 403 when the secret is wrong _(7ms)_
- ✅ rejects a body missing name with 400 _(7ms)_
- ✅ rejects a body missing email with 400 _(6ms)_
- ✅ rejects a body missing password with 400 _(8ms)_
- ✅ rejects a duplicate email with 409 _(81ms)_
- ✅ registered admins can log in and use admin-only endpoints _(159ms)_

### `tests/integration/vehicles.search.test.ts`

14/14 passing · 896ms

**GET /api/vehicles/search**

- ✅ allows searching without a token _(27ms)_
- ✅ filters by make _(29ms)_
- ✅ matches make case-insensitively _(14ms)_
- ✅ filters by model _(16ms)_
- ✅ filters by category _(16ms)_
- ✅ filters by fuel type, case-insensitively _(14ms)_
- ✅ rejects an unknown fuel type with 400 _(13ms)_
- ✅ filters by pre-launch status _(21ms)_
- ✅ searches make and model together with q _(26ms)_
- ✅ filters by price range (minPrice and maxPrice) _(14ms)_
- ✅ supports minPrice alone as an open-ended range _(13ms)_
- ✅ combines multiple filters with AND semantics _(17ms)_
- ✅ returns 200 with an empty list when nothing matches _(16ms)_
- ✅ rejects a non-numeric price filter with 400 _(12ms)_

### `tests/integration/inventory.restock.test.ts`

9/9 passing · 763ms

**POST /api/vehicles/:id/restock**

- ✅ rejects unauthenticated requests with 401 _(24ms)_
- ✅ rejects customers with 403 (admin-only) _(26ms)_
- ✅ lets an admin restock and increments the quantity _(21ms)_
- ✅ restocks an out-of-stock vehicle back to purchasable _(24ms)_
- ✅ rejects a zero quantity with 400 _(11ms)_
- ✅ rejects a negative quantity with 400 _(11ms)_
- ✅ rejects a non-numeric quantity with 400 _(11ms)_
- ✅ rejects a missing quantity with 400 _(12ms)_
- ✅ returns 404 for a vehicle that does not exist _(11ms)_

### `tests/integration/auth.login.test.ts`

7/7 passing · 668ms

**POST /api/auth/login**

- ✅ returns 200 and an access token for valid credentials _(38ms)_
- ✅ returns the user's public profile alongside the token _(10ms)_
- ✅ issues a JWT carrying the user id and role _(14ms)_
- ✅ rejects a wrong password with 401 _(11ms)_
- ✅ rejects an unknown email with 401 (no user enumeration) _(5ms)_
- ✅ rejects a body missing email with 400 _(7ms)_
- ✅ rejects a body missing password with 400 _(4ms)_

### `tests/integration/inventory.purchase.test.ts`

8/8 passing · 788ms

**POST /api/vehicles/:id/purchase**

- ✅ rejects unauthenticated requests with 401 _(18ms)_
- ✅ lets a customer purchase and decrements the quantity by one _(31ms)_
- ✅ records a purchase with the buyer and a price snapshot _(16ms)_
- ✅ keeps the snapshot price even if the vehicle price changes later _(16ms)_
- ✅ rejects a purchase when the vehicle is out of stock with 400 _(17ms)_
- ✅ sells down to zero and then refuses further purchases _(34ms)_
- ✅ returns 404 for a vehicle that does not exist _(9ms)_
- ✅ admins can purchase too (any authenticated user) _(14ms)_

### `tests/integration/uploads.test.ts`

4/4 passing · 757ms

**POST /api/uploads/vehicle-image**

- ✅ rejects unauthenticated requests with 401 _(19ms)_
- ✅ rejects customers with 403 (admin-only) _(25ms)_
- ✅ saves the image under public/uploads and returns its public url _(19ms)_
- ✅ rejects a request without a file with 400 _(15ms)_

### `tests/integration/users.me.test.ts`

7/7 passing · 740ms

**User profile and purchase history GET /api/users/me**

- ✅ rejects unauthenticated requests with 401 _(16ms)_
- ✅ returns the authenticated user's public profile _(23ms)_

**User profile and purchase history GET /api/users/me/purchases**

- ✅ rejects unauthenticated requests with 401 _(7ms)_
- ✅ returns an empty list when the user has bought nothing _(12ms)_
- ✅ returns the user's purchases with the vehicle details _(30ms)_
- ✅ only includes the requesting user's own purchases _(32ms)_
- ✅ keeps showing history for a vehicle that was later deleted _(29ms)_

### `tests/integration/bootstrap.test.ts`

3/3 passing · 689ms

**ensureDefaultAdmin**

- ✅ creates the default test admin when no admin exists _(167ms)_
- ✅ still creates the default admin when a different admin exists, so the demo credentials always work _(80ms)_
- ✅ is idempotent across repeated startups _(76ms)_

### `tests/unit/asyncHandler.test.ts`

3/3 passing · 96ms

**asyncHandler**

- ✅ invokes the wrapped handler with req, res, and next _(3ms)_
- ✅ does not call next when the handler resolves
- ✅ forwards an async rejection to next _(3ms)_

### `tests/unit/apiResponse.test.ts`

3/3 passing · 83ms

**returnResponse**

- ✅ sets the HTTP status code _(1ms)_
- ✅ sends a { statusCode, message, data } envelope _(1ms)_
- ✅ passes null data through unchanged

## Frontend — 121 tests in 20 files

### `src/auth/AuthContext.test.tsx`

6/6 passing · 471ms

**AuthContext**

- ✅ starts logged out when storage is empty _(61ms)_
- ✅ restores the session from storage _(14ms)_
- ✅ login stores the token and the user _(283ms)_
- ✅ register creates the account and then logs in _(51ms)_
- ✅ logout clears the session _(57ms)_
- ✅ exposes isAdmin for admin users _(4ms)_

### `src/auth/ProtectedRoute.test.tsx`

4/4 passing · 114ms

**ProtectedRoute**

- ✅ redirects logged-out visitors to /login _(88ms)_
- ✅ renders the protected content for a logged-in user _(8ms)_
- ✅ sends non-admins to the home page when adminOnly is set _(13ms)_
- ✅ lets admins through adminOnly routes _(5ms)_

### `src/api/admin.api.test.ts`

1/1 passing · 6ms

**registerAdmin**

- ✅ POSTs to /admin/register with the x-admin-secret header _(6ms)_

### `src/api/auth.api.test.ts`

2/2 passing · 11ms

**registerUser**

- ✅ POSTs the registration payload to /auth/register _(10ms)_

**loginUser**

- ✅ POSTs credentials to /auth/login and returns token plus user _(1ms)_

### `src/api/client.test.ts`

9/9 passing · 46ms

**token storage**

- ✅ stores and returns the access token _(5ms)_
- ✅ clears the token when set to null _(1ms)_

**request**

- ✅ calls the API base url with the given path _(8ms)_
- ✅ sends no Authorization header when there is no token _(1ms)_
- ✅ attaches the Bearer token when one is stored _(1ms)_
- ✅ serializes the body as JSON with the right content type _(2ms)_
- ✅ unwraps the response envelope and returns the parsed data _(4ms)_
- ✅ throws ApiError carrying the server message and status on failure _(10ms)_
- ✅ rejects when the response data does not match the schema _(14ms)_

### `src/api/schemas.test.ts`

8/8 passing · 13ms

**userSchema**

- ✅ accepts a valid user _(4ms)_
- ✅ rejects an unknown role _(1ms)_

**vehicleSchema**

- ✅ accepts a valid vehicle _(1ms)_
- ✅ rejects a non-numeric price _(1ms)_

**loginResponseSchema**

- ✅ requires both the access token and the user _(1ms)_

**purchaseResultSchema**

- ✅ accepts the vehicle plus purchase payload _(2ms)_

**purchaseHistoryEntrySchema**

- ✅ accepts an entry with vehicle details _(2ms)_
- ✅ accepts a null vehicle for deleted listings

### `src/api/users.api.test.ts`

2/2 passing · 9ms

**getMe**

- ✅ GETs /users/me and returns the profile _(7ms)_

**getMyPurchases**

- ✅ GETs /users/me/purchases and returns the history _(2ms)_

### `src/api/vehicles.api.test.ts`

8/8 passing · 27ms

**listVehicles**

- ✅ GETs /vehicles with the stored token _(14ms)_

**searchVehicles**

- ✅ includes only the provided filters in the query string _(2ms)_
- ✅ returns the matching vehicles _(1ms)_

**createVehicle**

- ✅ POSTs the vehicle payload to /vehicles _(1ms)_

**updateVehicle**

- ✅ PUTs the changes to /vehicles/:id _(1ms)_

**deleteVehicle**

- ✅ DELETEs /vehicles/:id _(1ms)_

**purchaseVehicle**

- ✅ POSTs to /vehicles/:id/purchase and returns vehicle plus purchase _(2ms)_

**restockVehicle**

- ✅ POSTs the quantity to /vehicles/:id/restock _(4ms)_

### `src/components/Navbar.test.tsx`

10/10 passing · 1.6s

**Navbar**

- ✅ shows the brand and a Cars link _(394ms)_
- ✅ search sits in the navbar and submits to the cars page _(327ms)_
- ✅ links to the electric and petrol collections _(57ms)_
- ✅ links to the pre-launch collection _(68ms)_
- ✅ is transparent at the top and turns solid after scrolling _(92ms)_
- ✅ shows a Login link when logged out _(74ms)_
- ✅ shows the account menu instead of Login when logged in _(135ms)_
- ✅ hides the admin item from customers _(127ms)_
- ✅ shows the admin item to admins _(125ms)_
- ✅ logs out from the account menu _(206ms)_

### `src/components/SplashScreen.test.tsx`

3/3 passing · 387ms

**SplashScreen**

- ✅ shows the car loader and hides the app while assets preload _(336ms)_
- ✅ reveals the app once the critical images have settled _(35ms)_
- ✅ still reveals the app when images fail to load _(16ms)_

### `src/components/Toast.test.tsx`

5/5 passing · 471ms

**ToastProvider**

- ✅ shows a success toast with role status _(319ms)_
- ✅ shows an error toast with role alert _(25ms)_
- ✅ stacks multiple toasts at once _(39ms)_
- ✅ dismisses a toast when its close button is clicked _(54ms)_
- ✅ auto-dismisses after a few seconds _(34ms)_

### `src/components/VehicleCard.test.tsx`

5/5 passing · 458ms

**VehicleCard**

- ✅ shows the vehicle details _(158ms)_
- ✅ links to the vehicle detail page _(232ms)_
- ✅ shows the out-of-stock badge when the quantity is zero _(14ms)_
- ✅ shows the vehicle photo when an image url is set _(41ms)_
- ✅ falls back to a placeholder when there is no image _(12ms)_

### `src/pages/AdminPage.test.tsx`

9/9 passing · 6.4s

**AdminPage**

- ✅ lists the existing inventory _(252ms)_
- ✅ adds a new vehicle through the form _(1.2s)_
- ✅ sends the chosen fuel type and pre-launch flag _(1.3s)_
- ✅ uploads the selected photo and sends its url with the new vehicle _(959ms)_
- ✅ uploads several photos: first is the main image, the rest the gallery _(973ms)_
- ✅ shows a success toast after adding a vehicle _(913ms)_
- ✅ deletes a vehicle from its row _(170ms)_
- ✅ restocks a vehicle from its row _(220ms)_
- ✅ edits a vehicle via the form and saves the changes _(489ms)_

### `src/pages/AdminRegisterPage.test.tsx`

5/5 passing · 2.7s

**AdminRegisterPage**

- ✅ renders name, email, password and admin secret fields _(350ms)_
- ✅ registers the admin with the secret, logs in and opens the admin panel _(1.2s)_
- ✅ shows the server error when the secret is wrong _(1.1s)_
- ✅ shows the demo admin credentials for quick testing _(16ms)_
- ✅ links back to the sign in page _(27ms)_

### `src/pages/CarsPage.test.tsx`

12/12 passing · 8.7s

**CarsPage**

- ✅ lists all cars with a count _(583ms)_
- ✅ has no apply button — filters apply on change _(608ms)_
- ✅ applies the name search automatically while typing _(1.1s)_
- ✅ applies the category filter as soon as it is picked _(813ms)_
- ✅ applies the price slider (0 to max price) as soon as it moves _(760ms)_
- ✅ does not send a price filter when the slider stays at the max _(927ms)_
- ✅ applies a category from the url on load _(389ms)_
- ✅ the petrol filter hides electric cars _(389ms)_
- ✅ the pre-launch filter shows only pre-launch cars _(395ms)_
- ✅ runs the navbar-provided query from the url on load _(381ms)_
- ✅ reset restores the full list _(1.5s)_
- ✅ shows an empty state when nothing matches _(961ms)_

### `src/pages/DashboardPage.test.tsx`

11/11 passing · 1.8s

**DashboardPage (home)**

- ✅ shows the connected brands section with the three drive-mode tabs _(382ms)_
- ✅ shows the featured car slider with the car name behind _(77ms)_
- ✅ slides to the next featured car with the arrow _(179ms)_
- ✅ switches the brands photo when a tab is picked _(152ms)_
- ✅ spotlights one car with its feature callouts after the hero _(61ms)_
- ✅ switches the spotlight car colour from the swatches _(156ms)_
- ✅ shows the priciest cars in the luxury collection _(156ms)_
- ✅ shows the cheapest cars in the affordable collection _(158ms)_
- ✅ ends every collection with a View more link to the cars page _(292ms)_
- ✅ closes with an invitation to visit the full collection _(111ms)_
- ✅ shows a simple footer _(54ms)_

### `src/pages/LoginPage.test.tsx`

4/4 passing · 1.6s

**LoginPage**

- ✅ renders email and password fields with a submit button _(331ms)_
- ✅ logs in with the entered credentials and navigates to the dashboard _(639ms)_
- ✅ shows the server error message when login fails _(562ms)_
- ✅ links to the register page _(29ms)_

### `src/pages/MyPurchasesPage.test.tsx`

5/5 passing · 630ms

**MyPurchasesPage**

- ✅ lists purchases with the vehicle details and price paid _(203ms)_
- ✅ shows the vehicle photo on the purchase entry _(297ms)_
- ✅ shows a placeholder tile when the vehicle has no photo _(43ms)_
- ✅ falls back gracefully when the vehicle was deleted _(40ms)_
- ✅ shows an empty state when nothing was bought yet _(45ms)_

### `src/pages/RegisterPage.test.tsx`

4/4 passing · 2.0s

**RegisterPage**

- ✅ renders name, email and password fields with a submit button _(336ms)_
- ✅ registers, auto-logs-in and navigates to the dashboard _(835ms)_
- ✅ shows the server error message when the email is taken _(808ms)_
- ✅ links to the login page _(42ms)_

### `src/pages/VehicleDetailPage.test.tsx`

8/8 passing · 1.1s

**VehicleDetailPage**

- ✅ loads and shows the full vehicle details _(404ms)_
- ✅ purchases from the detail page and updates the stock _(167ms)_
- ✅ disables the purchase button when the vehicle is out of stock _(74ms)_
- ✅ shows an error state when the vehicle does not exist _(36ms)_
- ✅ sends logged-out visitors to login when they try to purchase _(109ms)_
- ✅ shows gallery thumbnails and swaps the main photo on click _(147ms)_
- ✅ shows no thumbnail strip when there is only one photo _(68ms)_
- ✅ links back to the home page _(88ms)_
