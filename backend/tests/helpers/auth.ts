import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../../src/models/user.models.js";

const DEFAULT_PASSWORD = "Password123!";

// Low cost factor keeps the suite fast; security is irrelevant for test data.
const BCRYPT_ROUNDS = 4;

/** The shape tests need back from a created user document. */
type TestUser = { id: string; email: string; role: Role };

let emailCounter = 0;

/** Inserts a user directly into the database, bypassing the API. */
async function createUser(
    role: Role = Role.CUSTOMER,
    password: string = DEFAULT_PASSWORD
): Promise<{ user: TestUser; password: string }> {
    const user = await User.create({
        name: role === Role.ADMIN ? "Test Admin" : "Test Customer",
        email: `user-${++emailCounter}@test.example.com`,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role,
    });
    return {
        user: { id: user.id as string, email: user.email, role: user.role },
        password,
    };
}

/**
 * Signs a JWT with the same payload contract the app uses
 * ({ sub, email, role } — see src/utils/login.ts).
 */
function tokenFor(user: TestUser): string {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );
}

/** Creates a user of the given role and returns a ready-to-use auth header. */
async function authHeader(
    role: Role = Role.CUSTOMER
): Promise<{ user: TestUser; header: Record<string, string> }> {
    const { user } = await createUser(role);
    return { user, header: { Authorization: `Bearer ${tokenFor(user)}` } };
}

export { DEFAULT_PASSWORD, createUser, tokenFor, authHeader };
export type { TestUser };
