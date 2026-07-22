import request from "supertest";
import { app } from "../../src/app.js";
import { prisma, useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { createVehicle, UNKNOWN_UUID } from "../helpers/factories.js";
import { Role } from "../../src/generated/prisma/client.js";

const endpoint = (id: string) => `/api/vehicles/${id}/purchase`;

describe("POST /api/vehicles/:id/purchase", () => {
    useDb();

    it("rejects unauthenticated requests with 401", async () => {
        const vehicle = await createVehicle();

        const res = await request(app).post(endpoint(vehicle.id));

        expect(res.status).toBe(401);
    });

    it("lets a customer purchase and decrements the quantity by one", async () => {
        const vehicle = await createVehicle({ quantity: 5 });
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(res.status).toBe(200);
        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(4);
    });

    it("records a purchase with the buyer and a price snapshot", async () => {
        const vehicle = await createVehicle({ price: 45000, quantity: 2 });
        const { user, header } = await authHeader(Role.CUSTOMER);

        await request(app).post(endpoint(vehicle.id)).set(header);

        const purchases = await prisma.purchase.findMany();
        expect(purchases).toHaveLength(1);
        expect(purchases[0]).toMatchObject({
            userId: user.id,
            vehicleId: vehicle.id,
            quantity: 1,
        });
        expect(Number(purchases[0]!.purchasePrice)).toBe(45000);
    });

    it("keeps the snapshot price even if the vehicle price changes later", async () => {
        const vehicle = await createVehicle({ price: 45000, quantity: 2 });
        const { header } = await authHeader(Role.CUSTOMER);

        await request(app).post(endpoint(vehicle.id)).set(header);
        await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { price: 99999 },
        });

        const purchase = await prisma.purchase.findFirstOrThrow();
        expect(Number(purchase.purchasePrice)).toBe(45000);
    });

    it("rejects a purchase when the vehicle is out of stock with 400", async () => {
        const vehicle = await createVehicle({ quantity: 0 });
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(res.status).toBe(400);
        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(0); // never goes negative
        await expect(prisma.purchase.count()).resolves.toBe(0);
    });

    it("sells down to zero and then refuses further purchases", async () => {
        const vehicle = await createVehicle({ quantity: 2 });
        const { header } = await authHeader(Role.CUSTOMER);

        const first = await request(app).post(endpoint(vehicle.id)).set(header);
        const second = await request(app).post(endpoint(vehicle.id)).set(header);
        const third = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(third.status).toBe(400);

        const stored = await prisma.vehicle.findUnique({
            where: { id: vehicle.id },
        });
        expect(stored!.quantity).toBe(0);
        await expect(prisma.purchase.count()).resolves.toBe(2);
    });

    it("returns 404 for a vehicle that does not exist", async () => {
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).post(endpoint(UNKNOWN_UUID)).set(header);

        expect(res.status).toBe(404);
    });

    it("admins can purchase too (any authenticated user)", async () => {
        const vehicle = await createVehicle({ quantity: 1 });
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(res.status).toBe(200);
    });
});
