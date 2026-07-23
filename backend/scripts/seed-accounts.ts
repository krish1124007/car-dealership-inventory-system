/**
 * Creates — and optionally repairs — the two demo accounts (admin +
 * customer) in whichever database MONGODB_URI points at. Useful for a
 * live/Atlas database, or when the stored password no longer matches the
 * one the sign-in buttons send.
 *
 * Run with:
 *   npm run seed:accounts            create if missing, then verify
 *   npm run seed:accounts -- --reset also reset passwords to the expected ones
 *
 * Idempotent: without --reset nothing existing is ever modified.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Role } from "../src/models/user.models.js";
import { ensureDemoAccounts } from "../src/utils/ensureDemoAccounts.js";

const reset = process.argv.includes("--reset");

/** The credentials the app expects — same resolution as ensureDemoAccounts. */
const expected = [
    {
        label: "admin",
        email: process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@cardealership.com",
        password: process.env["DEFAULT_ADMIN_PASSWORD"] ?? "Admin@123",
        role: Role.ADMIN,
    },
    {
        label: "customer",
        email: process.env["DEFAULT_USER_EMAIL"] ?? "user@cardealership.com",
        password: process.env["DEFAULT_USER_PASSWORD"] ?? "User@123",
        role: Role.CUSTOMER,
    },
];

async function main(): Promise<void> {
    const uri = process.env["MONGODB_URI"];
    if (!uri) {
        throw new Error("MONGODB_URI is not set — check backend/.env");
    }

    await mongoose.connect(uri);
    // Host only: never print credentials from the connection string.
    console.log(
        `Connected to ${new URL(uri.replace("mongodb+srv", "https")).host}\n`
    );

    await ensureDemoAccounts();

    let broken = 0;
    for (const account of expected) {
        const user = await User.findOne({ email: account.email });
        if (!user) {
            console.log(`  ${account.label.padEnd(9)} MISSING  ${account.email}`);
            broken++;
            continue;
        }

        const matches = await bcrypt.compare(account.password, user.passwordHash);
        if (matches) {
            console.log(`  ${account.label.padEnd(9)} OK       ${account.email}`);
            continue;
        }

        broken++;
        if (reset) {
            user.passwordHash = await bcrypt.hash(account.password, 10);
            await user.save();
            console.log(
                `  ${account.label.padEnd(9)} RESET    ${account.email} — password rewritten`
            );
        } else {
            console.log(
                `  ${account.label.padEnd(9)} MISMATCH ${account.email} — stored password is not the expected one`
            );
        }
    }

    console.log(`\nTotal users in database: ${await User.countDocuments()}`);

    if (broken > 0 && !reset) {
        console.log(
            "\nThe sign-in buttons will fail for the accounts marked MISMATCH.\n" +
                "Either re-run with --reset to rewrite those passwords, or point\n" +
                "DEFAULT_ADMIN_PASSWORD / DEFAULT_USER_PASSWORD at the real ones."
        );
        process.exitCode = 1;
    }

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
