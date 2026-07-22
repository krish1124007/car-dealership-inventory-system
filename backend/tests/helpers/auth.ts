import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../src/db/index.js";
import { Role } from "../../src/generated/prisma/client.js";
import type { User } from "../../src/generated/prisma/client.js";

const DEFAULT_PASSWORD = "Password123!";

// Low cost factor keeps the suite fast; security is irrelevant for test data.
const BCRYPT_ROUNDS = 4;

let emailCounter = 0;

/** Inserts a user directly into the database, bypassing the API. */
async function createUser(
    role: Role = Role.CUSTOMER,
    password: string = DEFAULT_PASSWORD
): Promise<{ user: User; password: string }> {
    const user = await prisma.user.create({
        data: {
            name: role === Role.ADMIN ? "Test Admin" : "Test Customer",
            email: `user-${++emailCounter}@test.example.com`,
            passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
            role,
        },
    });
    return { user, password };
}

/**
 * Signs a JWT with the same payload contract the app uses
 * ({ sub, email, role } — see src/utils/login.ts).
 */
function tokenFor(user: User): string {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );
}

/** Creates a user of the given role and returns a ready-to-use auth header. */
async function authHeader(
    role: Role = Role.CUSTOMER
): Promise<{ user: User; header: Record<string, string> }> {
    const { user } = await createUser(role);
    return { user, header: { Authorization: `Bearer ${tokenFor(user)}` } };
}

export { DEFAULT_PASSWORD, createUser, tokenFor, authHeader };
