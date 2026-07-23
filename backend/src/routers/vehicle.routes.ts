import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
    listVehicles,
    searchVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    purchaseVehicle,
    restockVehicle,
} from "../controllers/vehicle.controller.js";

const vehicleRouter = Router();

// Browsing is public — anyone can window-shop the inventory.
// /search must be registered before the /:id routes.
vehicleRouter.get("/search", searchVehicles);
vehicleRouter.get("/", listVehicles);
vehicleRouter.get("/:id", getVehicle);

// Purchasing requires a logged-in user; management requires an admin.
vehicleRouter.post("/", requireAuth, requireAdmin, createVehicle);
vehicleRouter.put("/:id", requireAuth, requireAdmin, updateVehicle);
vehicleRouter.delete("/:id", requireAuth, requireAdmin, deleteVehicle);
vehicleRouter.post("/:id/purchase", requireAuth, purchaseVehicle);
vehicleRouter.post("/:id/restock", requireAuth, requireAdmin, restockVehicle);

export { vehicleRouter };
