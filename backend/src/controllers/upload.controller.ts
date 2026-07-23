import type { Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// On Vercel the filesystem is read-only and wiped between invocations, so
// uploads go to Vercel Blob (the token is injected by the Blob store
// integration). Local dev keeps writing to public/uploads on disk, which
// express.static("public") serves at /uploads/<filename>.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const uploadDir = path.join(process.cwd(), "public", "uploads");

function uniqueName(originalname: string): string {
    return `${crypto.randomUUID()}${path.extname(originalname).toLowerCase()}`;
}

function diskStorage() {
    fs.mkdirSync(uploadDir, { recursive: true });
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => cb(null, uniqueName(file.originalname)),
    });
}

/** Multer middleware: single "image" field, images only, max 5 MB. */
const uploadImage = multer({
    storage: useBlob ? multer.memoryStorage() : diskStorage(),
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

        if (useBlob) {
            const blob = await put(
                `vehicles/${uniqueName(file.originalname)}`,
                file.buffer,
                { access: "public", contentType: file.mimetype }
            );
            returnResponse(res, 201, "Image uploaded", { url: blob.url });
            return;
        }

        const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        returnResponse(res, 201, "Image uploaded", { url });
    }
);

export { uploadImage, handleVehicleImageUpload };
