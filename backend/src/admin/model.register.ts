import { User } from "../models/user.models.js";
import { Vehicle } from "../models/vehicle.models.js";
import { Purchase } from "../models/purchase.models.js";

// Registry of mongoose models, keyed by model name.
export const models = {
    user: User,
    vehicle: Vehicle,
    purchase: Purchase,
};
