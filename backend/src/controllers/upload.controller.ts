import type { Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Where uploads go depends on the environment:
//   - Vercel Blob when its token is present (the Blob store injects it)
//   - local disk otherwise, served by express.static("public") at /uploads/…
// Serverless filesystems are read-only, so disk is never an option there —
// falling back to it would crash the whole app at import time and take down
// every unrelated route with it.
const blobToken = process.env["BLOB_READ_WRITE_TOKEN"];
const onServerless = Boolean(process.env["VERCEL"]);
const useBlob = Boolean(blobToken);
const useDisk = !useBlob && !onServerless;

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

/** POST /api/uploads/vehicle-image (admin) — returns the public url. */
const handleVehicleImageUpload = asyncHandler(
    async (req: Request, res: Response) => {
        if (!useBlob && !useDisk) {
            returnResponse(
                res,
                503,
                "Image uploads are not configured — attach a Vercel Blob store to this project",
                null
            );
            return;
        }

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
