import { prisma } from "../../src/db/index.js";
import type { Vehicle } from "../../src/generated/prisma/client.js";

type VehicleAttrs = {
    make?: string;
    model?: string;
    category?: string;
    price?: number;
    quantity?: number;
};

/** A valid request body for POST /api/vehicles; override fields per test. */
function buildVehiclePayload(overrides: VehicleAttrs = {}) {
    return {
        make: "Toyota",
        model: "Corolla",
        category: "Sedan",
        price: 20000,
        quantity: 5,
        ...overrides,
    };
}

/** Inserts a vehicle directly into the database, bypassing the API. */
async function createVehicle(overrides: VehicleAttrs = {}): Promise<Vehicle> {
    return prisma.vehicle.create({ data: buildVehiclePayload(overrides) });
}

/** A well-formed UUID that no row will ever have. */
const UNKNOWN_UUID = "00000000-0000-4000-8000-000000000000";

export { buildVehiclePayload, createVehicle, UNKNOWN_UUID };
