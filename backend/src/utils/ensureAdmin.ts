import bcrypt from "bcrypt";
import { User, Role } from "../models/user.models.js";

/**
 * Guarantees the demo test-admin account exists so evaluators can log in
 * with the documented credentials without any setup. Runs on every
 * server start and is idempotent: the account is looked up by email, so
 * other admins never block it and it is never duplicated. Credentials
 * are overridable via DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD.
 */
async function ensureDefaultAdmin(): Promise<void> {
    const email = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@cardealership.com";
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin@123";

    const existing = await User.findOne({ email });
    if (existing) return;

    await User.create({
        name: "Test Admin",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.ADMIN,
    });

    console.log(
        `Default test admin created -> email: ${email} | password: ${password}`
    );
}

export { ensureDefaultAdmin };
