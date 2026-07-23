import type { Request, Response } from "express";
import { User } from "../../models/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";

/**
 * GET /api/admin/users (admin) — everyone registered on the site, oldest
 * first, with the last time each of them signed in. The model's toJSON
 * transform strips the password hash.
 */
const listUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await User.find().sort({ createdAt: 1 });

    returnResponse(res, 200, "Users fetched", {
        total: users.length,
        users: users.map((user) => user.toJSON()),
    });
});

export { listUsers };
