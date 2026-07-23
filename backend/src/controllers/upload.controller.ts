import type { Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Where uploads go depends on the environment:
//   - Cloudinary when it is configured (CLOUDINARY_URL, or the three
//     CLOUDINARY_* variables)
//   - local disk otherwise, served by express.static("public") at /uploads/…
// Serverless filesystems are read-only, so disk is never an option there —
// falling back to it would crash the whole app at import time and take down
// every unrelated route with it.
const onServerless = Boolean(process.env["VERCEL"]);

const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
const apiKey = process.env["CLOUDINARY_API_KEY"];
const apiSecret = process.env["CLOUDINARY_API_SECRET"];

const useCloudinary =
    Boolean(process.env["CLOUDINARY_URL"]) ||
    Boolean(cloudName && apiKey && apiSecret);

// The SDK self-configures from CLOUDINARY_URL; the split variables need an
// explicit call. Either way secure: true keeps the returned urls on https.
if (useCloudinary) {
    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    } else {
        cloudinary.config({ secure: true });
    }
}

const useDisk = !useCloudinary && !onServerless;

const uploadDir = path.join(process.cwd(), "public", "uploads");

function uniqueName(originalname: string): string {
    return `${crypto.randomUUID()}${path.extname(originalname).toLowerCase()}`;
}

function diskStorage() {
    return multer.diskStorage({
        // Created lazily, per upload, so an unwritable filesystem can never
        // break module loading.
        destination: (_req, _file, cb) => {
            fs.mkdir(uploadDir, { recursive: true }, (err) => {
                cb(err, uploadDir);
            });
        },
        filename: (_req, file, cb) => cb(null, uniqueName(file.originalname)),
    });
}

/** Multer middleware: single "image" field, images only, max 5 MB. */
const uploadImage = multer({
    storage: useDisk ? diskStorage() : multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
}).single("image");

/** Streams an in-memory buffer to Cloudinary and resolves its https url. */
function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "car-dealership/vehicles",
                public_id: path.parse(uniqueName(file.originalname)).name,
                resource_type: "image",
            },
            (error, result) => {
                if (error || !result) {
                    reject(error ?? new Error("Cloudinary upload failed"));
                    return;
                }
                resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
}

/** POST /api/uploads/vehicle-image (admin) — returns the public url. */
const handleVehicleImageUpload = asyncHandler(
    async (req: Request, res: Response) => {
        if (!useCloudinary && !useDisk) {
            returnResponse(
                res,
                503,
                "Image uploads are not configured — set CLOUDINARY_URL on this deployment",
                null
            );
            return;
        }

        const file = (req as Request & { file?: Express.Multer.File }).file;
        if (!file) {
            returnResponse(res, 400, "An image file is required", null);
            return;
        }

        if (useCloudinary) {
            try {
                const url = await uploadToCloudinary(file);
                returnResponse(res, 201, "Image uploaded", { url });
            } catch (err) {
                // Surface the provider's reason (bad credentials, quota) rather
                // than a bare 500 from the central error handler.
                console.error("Cloudinary upload failed", err);
                returnResponse(res, 502, "Image upload failed at Cloudinary", null);
            }
            return;
        }

        const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        returnResponse(res, 201, "Image uploaded", { url });
    }
);

export { uploadImage, handleVehicleImageUpload };
