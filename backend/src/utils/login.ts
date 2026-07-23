import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import type { IUser } from "../models/user.models.js";
import type { HydratedDocument } from "mongoose";

interface LoginResult {
    accessToken: string;
    user: HydratedDocument<IUser>;
}

/**
 * Verifies a user's credentials and returns a signed JWT access token plus
 * the authenticated user. Works for both customers and admins — the role is
 * embedded in the token payload so protected routes can authorize
 * admin-only actions.
 */
async function login(email: string, password: string): Promise<LoginResult> {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        throw new Error("Password is not correct");
    }

    const accessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    return { accessToken, user };
}

export { login };
