import bcrypt from "bcryptjs";
import { User, Role } from "../models/user.models.js";

interface DemoAccount {
    name: string;
    email: string;
    password: string;
    role: Role;
}

/**
 * The demo accounts the sign-in page logs into with one click. Admin
 * accounts are never created through the API — this is the only way one
 * comes into existence, so the credentials are the deployment's to control
 * via DEFAULT_ADMIN_* / DEFAULT_USER_*.
 */
function demoAccounts(): DemoAccount[] {
    return [
        {
            name: "Test Admin",
            email: process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@cardealership.com",
            password: process.env["DEFAULT_ADMIN_PASSWORD"] ?? "Admin@123",
            role: Role.ADMIN,
        },
        {
            name: "Demo Customer",
            email: process.env["DEFAULT_USER_EMAIL"] ?? "user@cardealership.com",
            password: process.env["DEFAULT_USER_PASSWORD"] ?? "User@123",
            role: Role.CUSTOMER,
        },
    ];
}

/**
 * Guarantees both demo accounts exist so a reviewer can sign in without any
 * setup. Runs on every server start and is idempotent: each account is
 * looked up by email, so it is never duplicated.
 */
async function ensureDemoAccounts(): Promise<void> {
    for (const account of demoAccounts()) {
        const existing = await User.findOne({ email: account.email });
        if (existing) continue;

        await User.create({
            name: account.name,
            email: account.email,
            passwordHash: await bcrypt.hash(account.password, 10),
            role: account.role,
        });

        console.log(
            `Demo ${account.role.toLowerCase()} created -> email: ${account.email} | password: ${account.password}`
        );
    }
}

export { ensureDemoAccounts };
