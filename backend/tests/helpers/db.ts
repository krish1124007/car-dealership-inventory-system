import { prisma } from "../../src/db/index.js";

/**
 * Deletes all rows from every table, children before parents so foreign
 * keys never block the wipe.
 */
async function resetDb(): Promise<void> {
    await prisma.purchase.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
}

/**
 * Standard lifecycle for integration test files: start each test from an
 * empty database and release the connection pool when the file finishes.
 */
function useDb(): void {
    beforeEach(async () => {
        await resetDb();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
}

export { prisma, resetDb, useDb };
