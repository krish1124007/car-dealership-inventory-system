import { connectDB, disconnectDB } from "../../src/db/index.js";
import { User } from "../../src/models/user.models.js";
import { Vehicle } from "../../src/models/vehicle.models.js";
import { Purchase } from "../../src/models/purchase.models.js";

/** Deletes every document from every collection. */
async function resetDb(): Promise<void> {
    await Promise.all([
        Purchase.deleteMany({}),
        Vehicle.deleteMany({}),
        User.deleteMany({}),
    ]);
}

/**
 * Standard lifecycle for integration test files: connect once, start each
 * test from an empty database, and disconnect when the file finishes.
 */
function useDb(): void {
    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        await resetDb();
    });

    afterAll(async () => {
        await disconnectDB();
    });
}

export { resetDb, useDb, User, Vehicle, Purchase };
