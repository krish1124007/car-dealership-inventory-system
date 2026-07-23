import { mongoose, connectDB, disconnectDB } from "../../src/db/index.js";
import { User } from "../../src/models/user.models.js";
import { Vehicle } from "../../src/models/vehicle.models.js";
import { Purchase } from "../../src/models/purchase.models.js";
import { ContactMessage } from "../../src/models/contact.models.js";

/**
 * Deletes every document from every collection.
 *
 * Driven by the live connection rather than a hand-written list, so a model
 * added later is cleaned up automatically instead of leaking documents into
 * the next test.
 */
async function resetDb(): Promise<void> {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
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

export { resetDb, useDb, User, Vehicle, Purchase, ContactMessage };
