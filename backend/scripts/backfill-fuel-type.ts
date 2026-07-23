/**
 * Backfills fuelType/preLaunch on vehicles created before those fields
 * existed, so server-side search filters match them.
 *
 * Run with: npm run backfill:fuel-type
 *
 * Idempotent: only touches documents that are missing the fields.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/vehicle.models.js";

async function main() {
    await mongoose.connect(process.env.MONGODB_URI as string);

    const fuel = await Vehicle.updateMany(
        { fuelType: { $exists: false } },
        { $set: { fuelType: "PETROL" } }
    );
    const pre = await Vehicle.updateMany(
        { preLaunch: { $exists: false } },
        { $set: { preLaunch: false } }
    );

    console.log(`fuelType backfilled on ${fuel.modifiedCount} vehicle(s)`);
    console.log(`preLaunch backfilled on ${pre.modifiedCount} vehicle(s)`);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
