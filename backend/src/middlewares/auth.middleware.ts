import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { returnResponse } from "../utils/apiResponse.js";
import { Role } from "../models/user.models.js";

interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

/** Request with the authenticated user attached by requireAuth. */
interface AuthRequest extends Request {
    user?: AuthUser;
}

/** Verifies the Bearer token and attaches the user payload to the request. */
function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        returnResponse(res, 401, "Authentication required", null);
        return;
    }

    try {
        const payload = jwt.verify(
            header.slice("Bearer ".length),
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;
        (req as AuthRequest).user = {
            id: String(payload.sub),
            email: String(payload["email"]),
            role: payload["role"] as Role,
        };
        next();
    } catch {
        returnResponse(res, 401, "Invalid or expired token", null);
    }
}

/** Allows the request through only for users with the ADMIN role. */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if ((req as AuthRequest).user?.role !== Role.ADMIN) {
        returnResponse(res, 403, "Admin access required", null);
        return;
    }
    next();
}

export { requireAuth, requireAdmin };
export type { AuthRequest, AuthUser };
