import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";
import { login } from "../utils/login.js";

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});

const BCRYPT_ROUNDS = 10;

/**
 * POST /api/auth/register — everyone registers as CUSTOMER; a role supplied
 * by the client is deliberately ignored.
 */
const register = asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Invalid registration data", null);
        return;
    }
    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
        returnResponse(res, 409, "Email is already registered", null);
        return;
    }

    const user = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });

    returnResponse(res, 201, "User registered", user.toJSON());
});

/** POST /api/auth/login */
const loginHandler = asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Email and password are required", null);
        return;
    }

    try {
        const { accessToken, user } = await login(
            parsed.data.email,
            parsed.data.password
        );
        returnResponse(res, 200, "Login successful", {
            accessToken,
            user: user.toJSON(),
        });
    } catch {
        // Same response for unknown email and wrong password, so the API
        // can't be used to probe which emails are registered.
        returnResponse(res, 401, "Invalid email or password", null);
    }
});

export { register, loginHandler };
