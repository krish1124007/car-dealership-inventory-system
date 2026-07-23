import { Vehicle } from "../../src/models/vehicle.models.js";
import type { FuelType } from "../../src/models/vehicle.models.js";

type VehicleAttrs = {
    make?: string;
    model?: string;
    category?: string;
    fuelType?: FuelType;
    preLaunch?: boolean;
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
async function createVehicle(overrides: VehicleAttrs = {}) {
    return Vehicle.create(buildVehiclePayload(overrides));
}

/** A well-formed ObjectId that no document will ever have. */
const UNKNOWN_ID = "0123456789abcdef01234567";

export { buildVehiclePayload, createVehicle, UNKNOWN_ID };
