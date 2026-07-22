import type { Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Uploaded files live under public/uploads so express.static("public")
// serves them directly at /uploads/<filename>.
const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) =>
        cb(
            null,
            `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`
        ),
});

/** Multer middleware: single "image" field, images only, max 5 MB. */
const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
}).single("image");

/** POST /api/uploads/vehicle-image (admin) — returns the public url. */
const handleVehicleImageUpload = asyncHandler(
    async (req: Request, res: Response) => {
        const file = (req as Request & { file?: Express.Multer.File }).file;
        if (!file) {
            returnResponse(res, 400, "An image file is required", null);
            return;
        }

        const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        returnResponse(res, 201, "Image uploaded", { url });
    }
);

export { uploadImage, handleVehicleImageUpload };
