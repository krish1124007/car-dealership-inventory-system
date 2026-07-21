# Car Dealership Inventory System – Functional Specification

## Overview

The Car Dealership Inventory System is a full-stack web application that allows users to browse, search, and purchase vehicles while enabling administrators to manage inventory securely through a role-based system.

The application exposes a RESTful API for authentication, vehicle management, and inventory operations.

---

# Authentication

## Register User

### Endpoint

`POST /api/auth/register`

### Description

Creates a new user account.

### Access

Public

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Validation Rules

* Name is required.
* Email is required.
* Email must be unique.
* Password is required.
* Password must meet the minimum length requirement.

### Success Response

* User account is created successfully.
* Password is stored in encrypted form.

### Error Cases

* Email already exists.
* Invalid request body.
* Missing required fields.

---

## Login User

### Endpoint

`POST /api/auth/login`

### Description

Authenticates an existing user and returns a JWT access token.

### Access

Public

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

Returns:

* JWT Access Token
* User Information
* User Role

### Error Cases

* Invalid email.
* Incorrect password.
* Missing credentials.

---

# Vehicle Management

All vehicle management endpoints require JWT authentication.

---

## Add Vehicle

### Endpoint

`POST /api/vehicles`

### Access

Admin Only

### Description

Creates a new vehicle in the inventory.

### Request Body

```json
{
  "make": "Toyota",
  "model": "Fortuner",
  "category": "SUV",
  "price": 4500000,
  "quantity": 5
}
```

### Validation Rules

* Make is required.
* Model is required.
* Category is required.
* Price must be greater than zero.
* Quantity cannot be negative.

### Success Response

* Vehicle created successfully.

### Error Cases

* Unauthorized.
* Validation failed.
* Invalid data.

---

## Get All Vehicles

### Endpoint

`GET /api/vehicles`

### Access

Authenticated Users

### Description

Returns every vehicle currently available in the inventory.

### Features

* Pagination (optional)
* Sorting (optional)

---

## Search Vehicles

### Endpoint

`GET /api/vehicles/search`

### Access

Authenticated Users

### Description

Returns vehicles matching one or more search filters.

### Supported Query Parameters

| Parameter | Description            |
| --------- | ---------------------- |
| make      | Search by manufacturer |
| model     | Search by model        |
| category  | Search by category     |
| minPrice  | Minimum price          |
| maxPrice  | Maximum price          |

### Example

```http
GET /api/vehicles/search?make=Toyota
```

```http
GET /api/vehicles/search?category=SUV
```

```http
GET /api/vehicles/search?minPrice=1000000&maxPrice=3000000
```

Multiple filters may be combined.

---

## Update Vehicle

### Endpoint

`PUT /api/vehicles/:id`

### Access

Admin Only

### Description

Updates an existing vehicle.

### Editable Fields

* Make
* Model
* Category
* Price
* Quantity

### Error Cases

* Vehicle not found.
* Unauthorized.
* Invalid data.

---

## Delete Vehicle

### Endpoint

`DELETE /api/vehicles/:id`

### Access

Admin Only

### Description

Permanently removes a vehicle from the inventory.

### Error Cases

* Vehicle not found.
* Unauthorized.

---

# Inventory Management

---

## Purchase Vehicle

### Endpoint

`POST /api/vehicles/:id/purchase`

### Access

Authenticated Users

### Description

Purchases one unit of the selected vehicle.

### Business Rules

* Quantity decreases by one.
* Purchase is rejected if quantity equals zero.
* Quantity can never become negative.

### Success Response

* Purchase successful.
* Updated inventory quantity returned.

### Error Cases

* Vehicle not found.
* Out of stock.
* Unauthorized.

---

## Restock Vehicle

### Endpoint

`POST /api/vehicles/:id/restock`

### Access

Admin Only

### Description

Adds stock to an existing vehicle.

### Request Body

```json
{
  "quantity": 10
}
```

### Business Rules

* Restock quantity must be greater than zero.
* Inventory quantity increases by the specified amount.

### Error Cases

* Invalid quantity.
* Vehicle not found.
* Unauthorized.

---

# Authentication & Authorization

## Authentication

Protected endpoints require a valid JWT access token.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## User Roles

### Customer

Allowed Actions

* Register
* Login
* View vehicles
* Search vehicles
* Purchase vehicles

Restricted Actions

* Add vehicle
* Update vehicle
* Delete vehicle
* Restock inventory

---

### Admin

Allowed Actions

* Register
* Login
* View vehicles
* Search vehicles
* Purchase vehicles
* Add vehicle
* Update vehicle
* Delete vehicle
* Restock inventory

---

# Vehicle Data Model

Each vehicle contains the following information:

| Field     | Description                           |
| --------- | ------------------------------------- |
| id        | Unique vehicle identifier             |
| make      | Vehicle manufacturer                  |
| model     | Vehicle model                         |
| category  | Vehicle category                      |
| price     | Selling price                         |
| quantity  | Number of vehicles available in stock |
| createdAt | Record creation timestamp             |
| updatedAt | Record last update timestamp          |

---

# Business Rules

* Every vehicle has a unique identifier.
* Email addresses must be unique.
* Passwords are stored securely using hashing.
* Only authenticated users can access protected endpoints.
* Only administrators can manage inventory.
* Vehicle quantity cannot be negative.
* Purchasing is disabled when stock reaches zero.
* Every API returns appropriate HTTP status codes and validation errors.
