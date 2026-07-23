/**
 * Wipes every admin account and creates exactly one, then proves it works by
 * running the real login path the API uses.
 *
 * Run with:
 *   npm run admin:reset
 *   npm run admin:reset -- --password "YourPassword123"
 *   npm run admin:reset -- --email boss@example.com --password "YourPassword123"
 *
 * Customers are never touched — only role: ADMIN documents are removed.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Role } from "../src/models/user.models.js";
import { login } from "../src/utils/login.js";

/** Reads `--flag value` from argv. */
function arg(name: string): string | undefined {
    const index = process.argv.indexOf(`--${name}`);
    if (index === -1) return undefined;
    return process.argv[index + 1];
}

const email =
    arg("email") ?? process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@cardealership.com";
const password =
    arg("password") ?? process.env["DEFAULT_ADMIN_PASSWORD"] ?? "Admin@123";

async function main(): Promise<void> {
    const uri = process.env["MONGODB_URI"];
    if (!uri) {
        throw new Error("MONGODB_URI is not set — check backend/.env");
    }

    await mongoose.connect(uri);
    const host = new URL(uri.replace("mongodb+srv", "https")).host;
    const dbName = mongoose.connection.name;
    console.log(`Database : ${host} / ${dbName}\n`);

    // 1. Show, then remove, every existing admin.
    const existing = await User.find({ role: Role.ADMIN });
    if (existing.length === 0) {
        console.log("No admin accounts found.");
    } else {
        console.log(`Removing ${existing.length} admin account(s):`);
        for (const admin of existing) {
            console.log(`  - ${admin.email}  (created ${admin.createdAt?.toISOString() ?? "unknown"})`);
        }
    }
    const removed = await User.deleteMany({ role: Role.ADMIN });

    // 2. Create exactly one. Any leftover account on this email (a customer,
    //    say) is replaced so the address is unambiguous.
    await User.deleteMany({ email });
    await User.create({
        name: "Administrator",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.ADMIN,
    });

    // 3. Prove it: run the same login the API runs, not just a hash compare.
    let verified = false;
    let failure = "";
    try {
        const result = await login(email, password);
        verified = result.user.role === Role.ADMIN && Boolean(result.accessToken);
    } catch (err) {
        failure = err instanceof Error ? err.message : String(err);
    }

    const adminCount = await User.countDocuments({ role: Role.ADMIN });

    console.log(`\nDeleted   : ${removed.deletedCount} admin account(s)`);
    console.log(`Admins now: ${adminCount}`);
    console.log(`Login test: ${verified ? "PASSED" : `FAILED ${failure}`}`);

    if (verified) {
        console.log("\n────────────────────────────────");
        console.log(" Use these to sign in:");
        console.log(`   email    : ${email}`);
        console.log(`   password : ${password}`);
        console.log("────────────────────────────────");
        console.log(
            "\nIf the deployed site still rejects them, its frontend was built with\n" +
                "VITE_DEMO_ADMIN_PASSWORD set to something else — update it to the\n" +
                "password above and redeploy (VITE_ values are baked in at build time)."
        );
    } else {
        process.exitCode = 1;
    }

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
