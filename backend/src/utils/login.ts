import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/index.js";

/**
 * Verifies a user's credentials and returns a signed JWT access token.
 * Works for both customers and admins — the role is embedded in the token
 * payload so protected routes can authorize admin-only actions.
 */
async function login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        throw new Error("Password is not correct");
    }

    const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    return token;
}

export { login };
