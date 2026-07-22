import type { Request, Response } from "express";
import { z } from "zod";
import { Vehicle } from "../models/vehicle.models.js";
import { Purchase } from "../models/purchase.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const createVehicleSchema = z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    category: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().min(0).default(0),
    imageUrl: z.url().optional(),
});

const updateVehicleSchema = z.object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().min(0).optional(),
    imageUrl: z.url().optional(),
});

const searchSchema = z.object({
    q: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
});

const restockSchema = z.object({
    quantity: z.number().int().positive(),
});

/** Case-insensitive exact match, with regex metacharacters neutralized. */
function ciExact(value: string): RegExp {
    return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

/** Case-insensitive contains match, for free-text name search. */
function ciContains(value: string): RegExp {
    return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

/** GET /api/vehicles */
const listVehicles = asyncHandler(async (_req: Request, res: Response) => {
    const vehicles = await Vehicle.find();
    returnResponse(res, 200, "Vehicles fetched", vehicles);
});

/** GET /api/vehicles/search */
const searchVehicles = asyncHandler(async (req: Request, res: Response) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
        returnResponse(res, 400, "Invalid search filters", null);
        return;
    }
    const { q, make, model, category, minPrice, maxPrice } = parsed.data;

    const filter: Record<string, unknown> = {};
    // Free-text name search: matches make or model, partial and
    // case-insensitive.
    if (q) filter["$or"] = [{ make: ciContains(q) }, { model: ciContains(q) }];
    if (make) filter["make"] = ciExact(make);
    if (model) filter["model"] = ciExact(model);
    if (category) filter["category"] = ciExact(category);

    const priceRange: Record<string, number> = {};
    if (minPrice !== undefined) priceRange["$gte"] = minPrice;
    if (maxPrice !== undefined) priceRange["$lte"] = maxPrice;
    if (Object.keys(priceRange).length > 0) filter["price"] = priceRange;

    const vehicles = await Vehicle.find(filter);
    returnResponse(res, 200, "Search results", vehicles);
});

/** POST /api/vehicles (admin) */
const createVehicle = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Invalid vehicle data", null);
        return;
    }

    const { imageUrl, ...rest } = parsed.data;
    const vehicle = await Vehicle.create({
        ...rest,
        ...(imageUrl !== undefined && { imageUrl }),
    });
    returnResponse(res, 201, "Vehicle added", vehicle.toJSON());
});

/** PUT /api/vehicles/:id (admin) */
const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Invalid vehicle data", null);
        return;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id as string,
        parsed.data,
        { returnDocument: "after" }
    );
    if (!vehicle) {
        returnResponse(res, 404, "Vehicle not found", null);
        return;
    }

    returnResponse(res, 200, "Vehicle updated", vehicle.toJSON());
});

/** DELETE /api/vehicles/:id (admin) */
const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id as string);
    if (!vehicle) {
        returnResponse(res, 404, "Vehicle not found", null);
        return;
    }

    returnResponse(res, 200, "Vehicle deleted", null);
});

/** POST /api/vehicles/:id/purchase (any authenticated user) */
const purchaseVehicle = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const exists = await Vehicle.findById(id);
    if (!exists) {
        returnResponse(res, 404, "Vehicle not found", null);
        return;
    }

    // Atomic decrement guarded by quantity > 0 so stock never goes negative,
    // even under concurrent purchases.
    const vehicle = await Vehicle.findOneAndUpdate(
        { _id: id, quantity: { $gt: 0 } },
        { $inc: { quantity: -1 } },
        { returnDocument: "after" }
    );
    if (!vehicle) {
        returnResponse(res, 400, "Vehicle is out of stock", null);
        return;
    }

    const purchase = await Purchase.create({
        userId: (req as AuthRequest).user!.id,
        vehicleId: vehicle.id,
        quantity: 1,
        purchasePrice: vehicle.price,
    });

    returnResponse(res, 200, "Vehicle purchased", {
        vehicle: vehicle.toJSON(),
        purchase: purchase.toJSON(),
    });
});

/** POST /api/vehicles/:id/restock (admin) */
const restockVehicle = asyncHandler(async (req: Request, res: Response) => {
    const parsed = restockSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Restock quantity must be a positive integer", null);
        return;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id as string,
        { $inc: { quantity: parsed.data.quantity } },
        { returnDocument: "after" }
    );
    if (!vehicle) {
        returnResponse(res, 404, "Vehicle not found", null);
        return;
    }

    returnResponse(res, 200, "Vehicle restocked", vehicle.toJSON());
});

export {
    listVehicles,
    searchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    purchaseVehicle,
    restockVehicle,
};
