import request from "supertest";
import { app } from "../../src/app.js";
import { prisma, useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { createVehicle, UNKNOWN_UUID } from "../helpers/factories.js";
import { Role } from "../../src/generated/prisma/client.js";

const endpoint = (id: string) => `/api/vehicles/${id}/restock`;

describe("POST /api/vehicles/:id/restock", () => {
    useDb();

    it("rejects unauthenticated requests with 401", async () => {
        const vehicle = await createVehicle();

        const res = await request(app)
            .post(endpoint(vehicle.id))
            .send({ quantity: 5 });

        expect(res.status).toBe(401);
    });

    it("rejects customers with 403 (admin-only)", async () => {
        const vehicle = await createVehicle({ quantity: 3 });
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .post(endpoint(vehicle.id))
            .set(header)
            .send({ quantity: 5 });

        expect(res.status).toBe(403);
        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(3);
    });

    it("lets an admin restock and increments the quantity", async () => {
        const vehicle = await createVehicle({ quantity: 3 });
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app)
            .post(endpoint(vehicle.id))
            .set(header)
            .send({ quantity: 5 });

        expect(res.status).toBe(200);
        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(8);
    });

    it("restocks an out-of-stock vehicle back to purchasable", async () => {
        const vehicle = await createVehicle({ quantity: 0 });
        const { header } = await authHeader(Role.ADMIN);

        await request(app)
            .post(endpoint(vehicle.id))
            .set(header)
            .send({ quantity: 2 });

        const purchaseRes = await request(app)
            .post(`/api/vehicles/${vehicle.id}/purchase`)
            .set(header);

        expect(purchaseRes.status).toBe(200);
    });

    it.each([
        ["a zero quantity", { quantity: 0 }],
        ["a negative quantity", { quantity: -5 }],
        ["a non-numeric quantity", { quantity: "many" }],
        ["a missing quantity", {}],
    ])("rejects %s with 400", async (_label, body) => {
        const vehicle = await createVehicle({ quantity: 3 });
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app)
            .post(endpoint(vehicle.id))
            .set(header)
            .send(body);

        expect(res.status).toBe(400);
        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(3);
    });

    it("returns 404 for a vehicle that does not exist", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app)
            .post(endpoint(UNKNOWN_UUID))
            .set(header)
            .send({ quantity: 5 });

        expect(res.status).toBe(404);
    });
});
