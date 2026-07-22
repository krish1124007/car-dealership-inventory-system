import request from "supertest";
import { app } from "../../src/app.js";
import { useDb, Vehicle } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import {
    buildVehiclePayload,
    createVehicle,
    UNKNOWN_ID,
} from "../helpers/factories.js";
import { Role } from "../../src/models/user.models.js";

describe("Vehicle CRUD", () => {
    useDb();

    describe("GET /api/vehicles", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const res = await request(app).get("/api/vehicles");

            expect(res.status).toBe(401);
        });

        it("rejects an invalid token with 401", async () => {
            const res = await request(app)
                .get("/api/vehicles")
                .set("Authorization", "Bearer not-a-real-token");

            expect(res.status).toBe(401);
        });

        it("returns all vehicles for an authenticated customer", async () => {
            await createVehicle({ make: "Toyota", model: "Corolla" });
            await createVehicle({ make: "Honda", model: "City" });
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app).get("/api/vehicles").set(header);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toMatchObject({
                id: expect.any(String),
                make: expect.any(String),
                model: expect.any(String),
                category: expect.any(String),
            });
        });

        it("returns an empty list when there is no inventory", async () => {
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app).get("/api/vehicles").set(header);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });

    describe("POST /api/vehicles", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const res = await request(app)
                .post("/api/vehicles")
                .send(buildVehiclePayload());

            expect(res.status).toBe(401);
        });

        it("rejects customers with 403 (admin-only)", async () => {
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app)
                .post("/api/vehicles")
                .set(header)
                .send(buildVehiclePayload());

            expect(res.status).toBe(403);
            await expect(Vehicle.countDocuments()).resolves.toBe(0);
        });

        it("lets an admin add a vehicle and persists it", async () => {
            const { header } = await authHeader(Role.ADMIN);
            const payload = buildVehiclePayload({ make: "Tesla", model: "Model 3" });

            const res = await request(app)
                .post("/api/vehicles")
                .set(header)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data).toMatchObject({
                make: "Tesla",
                model: "Model 3",
                category: payload.category,
                quantity: payload.quantity,
            });
            expect(Number(res.body.data.price)).toBe(payload.price);

            const stored = await Vehicle.findById(res.body.data.id);
            expect(stored).not.toBeNull();
        });

        it("stores an optional image url with the vehicle", async () => {
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .post("/api/vehicles")
                .set(header)
                .send({
                    ...buildVehiclePayload(),
                    imageUrl: "https://example.com/cars/corolla.jpg",
                });

            expect(res.status).toBe(201);
            expect(res.body.data.imageUrl).toBe(
                "https://example.com/cars/corolla.jpg"
            );

            const stored = await Vehicle.findById(res.body.data.id);
            expect(stored!.imageUrl).toBe(
                "https://example.com/cars/corolla.jpg"
            );
        });

        it.each(["make", "model", "category", "price"])(
            "rejects a body missing %s with 400",
            async (field) => {
                const { header } = await authHeader(Role.ADMIN);
                const payload: Record<string, unknown> = buildVehiclePayload();
                delete payload[field];

                const res = await request(app)
                    .post("/api/vehicles")
                    .set(header)
                    .send(payload);

                expect(res.status).toBe(400);
            }
        );

        it.each([
            ["a negative price", { price: -100 }],
            ["a zero price", { price: 0 }],
            ["a negative quantity", { quantity: -1 }],
        ])("rejects %s with 400", async (_label, overrides) => {
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .post("/api/vehicles")
                .set(header)
                .send(buildVehiclePayload(overrides));

            expect(res.status).toBe(400);
            await expect(Vehicle.countDocuments()).resolves.toBe(0);
        });
    });

    describe("PUT /api/vehicles/:id", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const vehicle = await createVehicle();

            const res = await request(app)
                .put(`/api/vehicles/${vehicle.id}`)
                .send({ price: 25000 });

            expect(res.status).toBe(401);
        });

        it("rejects customers with 403 (admin-only)", async () => {
            const vehicle = await createVehicle({ price: 20000 });
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app)
                .put(`/api/vehicles/${vehicle.id}`)
                .set(header)
                .send({ price: 1 });

            expect(res.status).toBe(403);
            const stored = await Vehicle.findById(vehicle.id);
            expect(Number(stored!.price)).toBe(20000);
        });

        it("lets an admin update vehicle details", async () => {
            const vehicle = await createVehicle({ price: 20000, quantity: 5 });
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .put(`/api/vehicles/${vehicle.id}`)
                .set(header)
                .send({ price: 22000, quantity: 8 });

            expect(res.status).toBe(200);
            const stored = await Vehicle.findById(vehicle.id);
            expect(Number(stored!.price)).toBe(22000);
            expect(stored!.quantity).toBe(8);
        });

        it("returns 404 for a vehicle that does not exist", async () => {
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .put(`/api/vehicles/${UNKNOWN_ID}`)
                .set(header)
                .send({ price: 22000 });

            expect(res.status).toBe(404);
        });

        it("rejects an invalid update (negative price) with 400", async () => {
            const vehicle = await createVehicle();
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .put(`/api/vehicles/${vehicle.id}`)
                .set(header)
                .send({ price: -5 });

            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /api/vehicles/:id", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const vehicle = await createVehicle();

            const res = await request(app).delete(`/api/vehicles/${vehicle.id}`);

            expect(res.status).toBe(401);
        });

        it("rejects customers with 403 (admin-only)", async () => {
            const vehicle = await createVehicle();
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app)
                .delete(`/api/vehicles/${vehicle.id}`)
                .set(header);

            expect(res.status).toBe(403);
            await expect(Vehicle.countDocuments()).resolves.toBe(1);
        });

        it("lets an admin delete a vehicle", async () => {
            const vehicle = await createVehicle();
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .delete(`/api/vehicles/${vehicle.id}`)
                .set(header);

            expect(res.status).toBe(200);
            await expect(Vehicle.findById(vehicle.id)).resolves.toBeNull();
        });

        it("returns 404 for a vehicle that does not exist", async () => {
            const { header } = await authHeader(Role.ADMIN);

            const res = await request(app)
                .delete(`/api/vehicles/${UNKNOWN_ID}`)
                .set(header);

            expect(res.status).toBe(404);
        });
    });
});
