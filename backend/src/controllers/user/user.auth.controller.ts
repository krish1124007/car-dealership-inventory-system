import type { Request, Response } from "express";
import { User } from "../../models/user.models.js";
import { Purchase } from "../../models/purchase.models.js";
import { Vehicle } from "../../models/vehicle.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";

/** GET /api/users/me — the authenticated user's public profile. */
const getMe = asyncHandler(async (req: Request, res: Response) => {
    const id = (req as AuthRequest).user!.id;

    const user = await User.findById(id);
    if (!user) {
        returnResponse(res, 404, "User not found", null);
        return;
    }

    returnResponse(res, 200, "Profile fetched", user.toJSON());
});

/**
 * GET /api/users/me/purchases — the authenticated user's purchase history,
 * newest first, with the vehicle details joined in. The vehicle is null when
 * the listing was deleted after purchase — the audit record itself survives.
 */
const getMyPurchases = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;

    const purchases = await Purchase.find({ userId }).sort({ purchasedAt: -1 });

    const vehicles = await Vehicle.find({
        _id: { $in: purchases.map((p) => p.vehicleId) },
    });
    const vehiclesById = new Map(vehicles.map((v) => [String(v.id), v]));

    const history = purchases.map((p) => ({
        id: String(p.id),
        quantity: p.quantity,
        purchasePrice: p.purchasePrice,
        purchasedAt: p.purchasedAt,
        vehicle: vehiclesById.get(String(p.vehicleId))?.toJSON() ?? null,
    }));

    returnResponse(res, 200, "Purchase history fetched", history);
});

export { getMe, getMyPurchases };
