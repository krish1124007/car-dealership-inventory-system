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

// Every vehicle endpoint requires authentication.
vehicleRouter.use(requireAuth);

// /search must be registered before the /:id routes.
vehicleRouter.get("/search", searchVehicles);
vehicleRouter.get("/", listVehicles);
vehicleRouter.get("/:id", getVehicle);
vehicleRouter.post("/", requireAdmin, createVehicle);
vehicleRouter.put("/:id", requireAdmin, updateVehicle);
vehicleRouter.delete("/:id", requireAdmin, deleteVehicle);
vehicleRouter.post("/:id/purchase", purchaseVehicle);
vehicleRouter.post("/:id/restock", requireAdmin, restockVehicle);

export { vehicleRouter };
