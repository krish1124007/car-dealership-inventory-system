import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
    uploadImage,
    handleVehicleImageUpload,
} from "../controllers/upload.controller.js";

const uploadRouter = Router();

uploadRouter.post(
    "/vehicle-image",
    requireAuth,
    requireAdmin,
    uploadImage,
    handleVehicleImageUpload
);

export { uploadRouter };
