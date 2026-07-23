import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, Role } from "../../models/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";

const registerAdminSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
});

const BCRYPT_ROUNDS = 10;

/**
 * POST /api/admin/register — creates an ADMIN account.
 *
 * Public registration always produces CUSTOMER accounts, so admin creation
 * is gated by a shared secret (ADMIN_REGISTRATION_SECRET) supplied in the
 * x-admin-secret header. Admins log in through the normal /api/auth/login
 * endpoint; their role travels in the JWT.
 */
const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const expected = process.env.ADMIN_REGISTRATION_SECRET;
    const provided = req.headers["x-admin-secret"];
    // Refuse when the server has no secret configured — never fall open.
    if (!expected || provided !== expected) {
        returnResponse(res, 403, "Invalid admin registration secret", null);
        return;
    }

    const parsed = registerAdminSchema.safeParse(req.body);
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

    const admin = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role: Role.ADMIN,
    });

    returnResponse(res, 201, "Admin registered", admin.toJSON());
});

export { registerAdmin };
