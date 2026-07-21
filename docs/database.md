# Database Design

## Overview

The Car Dealership Inventory System uses a relational database to manage users, vehicles, and purchase records. The database is designed using normalization principles to reduce redundancy while maintaining data integrity and scalability.

The system consists of three primary entities:

* **Users**
* **Vehicles**
* **Purchases**

---

# Entity Relationship Diagram

```text
                 +----------------------+
                 |        Users         |
                 +----------------------+
                 | id (UUID)            |
                 | name                 |
                 | email (Unique)       |
                 | passwordHash         |
                 | role                 |
                 | createdAt            |
                 | updatedAt            |
                 +----------------------+
                           |
                           | 1
                           |
                           |───────────────┐
                                           │
                                           │
                                           ▼
                 +----------------------+
                 |      Purchases       |
                 +----------------------+
                 | id (UUID)            |
                 | userId (FK)          |
                 | vehicleId (FK)       |
                 | quantity             |
                 | purchasePrice        |
                 | purchasedAt          |
                 +----------------------+
                           ▲
                           │
                           │
                           │ *
                 +----------------------+
                 |      Vehicles        |
                 +----------------------+
                 | id (UUID)            |
                 | make                 |
                 | model                |
                 | category             |
                 | price                |
                 | quantity             |
                 | createdAt            |
                 | updatedAt            |
                 +----------------------+
```

---

# Tables

## Users

Stores authentication and authorization information.

| Column       | Type     | Description               |
| ------------ | -------- | ------------------------- |
| id           | UUID     | Primary key               |
| name         | String   | Full name                 |
| email        | String   | Unique email address      |
| passwordHash | String   | Encrypted password        |
| role         | Enum     | CUSTOMER or ADMIN         |
| createdAt    | DateTime | Record creation timestamp |
| updatedAt    | DateTime | Last updated timestamp    |

---

## Vehicles

Stores all available vehicles in the dealership inventory.

| Column    | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| id        | UUID     | Primary key                                    |
| make      | String   | Vehicle manufacturer                           |
| model     | String   | Vehicle model                                  |
| category  | String   | Vehicle category (SUV, Sedan, Hatchback, etc.) |
| price     | Decimal  | Selling price                                  |
| quantity  | Integer  | Available stock                                |
| createdAt | DateTime | Record creation timestamp                      |
| updatedAt | DateTime | Last updated timestamp                         |

---

## Purchases

Stores every completed vehicle purchase.

| Column        | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| id            | UUID     | Primary key                   |
| userId        | UUID     | References Users.id           |
| vehicleId     | UUID     | References Vehicles.id        |
| quantity      | Integer  | Number of vehicles purchased  |
| purchasePrice | Decimal  | Price at the time of purchase |
| purchasedAt   | DateTime | Purchase timestamp            |

---

# Relationships

## Users → Purchases

* One user can make multiple purchases.
* Every purchase belongs to exactly one user.

**Relationship:** One-to-Many

---

## Vehicles → Purchases

* One vehicle can appear in multiple purchase records.
* Every purchase references exactly one vehicle.

**Relationship:** One-to-Many

---

# Database Constraints

## Users

* Email must be unique.
* Password is stored as a hash.
* Role must be either `CUSTOMER` or `ADMIN`.

---

## Vehicles

* Price must be greater than zero.
* Quantity cannot be negative.
* Every vehicle has a unique identifier.

---

## Purchases

* Quantity must be greater than zero.
* Purchase cannot be completed if the vehicle stock is zero.
* `userId` must reference an existing user.
* `vehicleId` must reference an existing vehicle.

---

# Business Rules

* Only authenticated users can purchase vehicles.
* Only administrators can add, update, delete, or restock vehicles.
* Purchasing a vehicle decreases the available quantity.
* Restocking increases the available quantity.
* Vehicle quantity can never become negative.
* Purchase records are immutable and serve as an audit trail.

---

# Design Decisions

* **UUIDs** are used as primary keys to ensure globally unique identifiers.
* A separate **Purchases** table is used instead of only decreasing vehicle quantity, allowing the system to maintain a complete purchase history.
* The `purchasePrice` field stores the price at the time of purchase so historical records remain accurate even if vehicle prices change later.
* Timestamps (`createdAt`, `updatedAt`, and `purchasedAt`) are included to support auditing and future reporting features.
