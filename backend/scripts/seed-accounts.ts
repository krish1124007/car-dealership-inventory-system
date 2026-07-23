/**
 * Creates the two demo accounts (admin + customer) in whichever database
 * MONGODB_URI points at — useful for a live/Atlas database that has never
 * had the server booted against it.
 *
 * Run with: npm run seed:accounts
 *
 * Idempotent: each account is looked up by email, so re-running changes
 * nothing. Existing accounts are never modified.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/user.models.js";
import { ensureDemoAccounts } from "../src/utils/ensureDemoAccounts.js";

async function main(): Promise<void> {
    const uri = process.env["MONGODB_URI"];
    if (!uri) {
        throw new Error("MONGODB_URI is not set — check backend/.env");
    }

    await mongoose.connect(uri);
    // Host only: never print credentials from the connection string.
    console.log(`Connected to ${new URL(uri.replace("mongodb+srv", "https")).host}`);

    await ensureDemoAccounts();

    const accounts = await User.find({
        email: {
            $in: [
                process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@cardealership.com",
                process.env["DEFAULT_USER_EMAIL"] ?? "user@cardealership.com",
            ],
        },
    });

    console.log("\nDemo accounts in this database:");
    for (const account of accounts) {
        console.log(`  ${account.role.padEnd(8)} ${account.email}`);
    }
    console.log(`\nTotal users in database: ${await User.countDocuments()}`);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
