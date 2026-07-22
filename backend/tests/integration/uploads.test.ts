import request from "supertest";
import fs from "node:fs";
import path from "node:path";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { Role } from "../../src/models/user.models.js";

const ENDPOINT = "/api/uploads/vehicle-image";

// Smallest valid PNG header — enough for an upload test.
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe(`POST ${ENDPOINT}`, () => {
    useDb();

    it("rejects unauthenticated requests with 401", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .attach("image", pngBytes, "car.png");

        expect(res.status).toBe(401);
    });

    it("rejects customers with 403 (admin-only)", async () => {
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .post(ENDPOINT)
            .set(header)
            .attach("image", pngBytes, "car.png");

        expect(res.status).toBe(403);
    });

    it("saves the image under public/uploads and returns its public url", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app)
            .post(ENDPOINT)
            .set(header)
            .attach("image", pngBytes, "car.png");

        expect(res.status).toBe(201);
        expect(res.body.data.url).toMatch(/\/uploads\/[^/]+\.png$/);

        const filename = res.body.data.url.split("/uploads/")[1] as string;
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        expect(fs.existsSync(filePath)).toBe(true);

        fs.unlinkSync(filePath);
    });

    it("rejects a request without a file with 400", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).post(ENDPOINT).set(header);

        expect(res.status).toBe(400);
    });
});
