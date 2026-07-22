import request from "supertest";
import { app } from "../../src/app.js";
import { useDb, Vehicle, Purchase } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { createVehicle, UNKNOWN_ID } from "../helpers/factories.js";
import { Role } from "../../src/models/user.models.js";

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
        const stored = await Vehicle.findById(vehicle.id);
        expect(stored!.quantity).toBe(4);
    });

    it("records a purchase with the buyer and a price snapshot", async () => {
        const vehicle = await createVehicle({ price: 45000, quantity: 2 });
        const { user, header } = await authHeader(Role.CUSTOMER);

        await request(app).post(endpoint(vehicle.id)).set(header);

        const purchases = await Purchase.find();
        expect(purchases).toHaveLength(1);
        expect(String(purchases[0]!.userId)).toBe(user.id);
        expect(String(purchases[0]!.vehicleId)).toBe(vehicle.id);
        expect(purchases[0]!.quantity).toBe(1);
        expect(Number(purchases[0]!.purchasePrice)).toBe(45000);
    });

    it("keeps the snapshot price even if the vehicle price changes later", async () => {
        const vehicle = await createVehicle({ price: 45000, quantity: 2 });
        const { header } = await authHeader(Role.CUSTOMER);

        await request(app).post(endpoint(vehicle.id)).set(header);
        await Vehicle.findByIdAndUpdate(vehicle.id, { price: 99999 });

        const purchase = await Purchase.findOne();
        expect(purchase).not.toBeNull();
        expect(Number(purchase!.purchasePrice)).toBe(45000);
    });

    it("rejects a purchase when the vehicle is out of stock with 400", async () => {
        const vehicle = await createVehicle({ quantity: 0 });
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(res.status).toBe(400);
        const stored = await Vehicle.findById(vehicle.id);
        expect(stored!.quantity).toBe(0); // never goes negative
        await expect(Purchase.countDocuments()).resolves.toBe(0);
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

        const stored = await Vehicle.findById(vehicle.id);
        expect(stored!.quantity).toBe(0);
        await expect(Purchase.countDocuments()).resolves.toBe(2);
    });

    it("returns 404 for a vehicle that does not exist", async () => {
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).post(endpoint(UNKNOWN_ID)).set(header);

        expect(res.status).toBe(404);
    });

    it("admins can purchase too (any authenticated user)", async () => {
        const vehicle = await createVehicle({ quantity: 1 });
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).post(endpoint(vehicle.id)).set(header);

        expect(res.status).toBe(200);
    });
});
