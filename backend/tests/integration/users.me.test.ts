import request from "supertest";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { createVehicle } from "../helpers/factories.js";
import { Role } from "../../src/models/user.models.js";

describe("User profile and purchase history", () => {
    useDb();

    describe("GET /api/users/me", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const res = await request(app).get("/api/users/me");

            expect(res.status).toBe(401);
        });

        it("returns the authenticated user's public profile", async () => {
            const { user, header } = await authHeader(Role.CUSTOMER);

            const res = await request(app).get("/api/users/me").set(header);

            expect(res.status).toBe(200);
            expect(res.body.data).toMatchObject({
                id: user.id,
                email: user.email,
                role: "CUSTOMER",
            });
            expect(res.body.data.passwordHash).toBeUndefined();
        });
    });

    describe("GET /api/users/me/purchases", () => {
        it("rejects unauthenticated requests with 401", async () => {
            const res = await request(app).get("/api/users/me/purchases");

            expect(res.status).toBe(401);
        });

        it("returns an empty list when the user has bought nothing", async () => {
            const { header } = await authHeader(Role.CUSTOMER);

            const res = await request(app)
                .get("/api/users/me/purchases")
                .set(header);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it("returns the user's purchases with the vehicle details", async () => {
            const vehicle = await createVehicle({
                make: "Toyota",
                model: "Fortuner",
                price: 45000,
                quantity: 3,
            });
            const { header } = await authHeader(Role.CUSTOMER);

            await request(app)
                .post(`/api/vehicles/${vehicle.id}/purchase`)
                .set(header);
            await request(app)
                .post(`/api/vehicles/${vehicle.id}/purchase`)
                .set(header);

            const res = await request(app)
                .get("/api/users/me/purchases")
                .set(header);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(Number(res.body.data[0].purchasePrice)).toBe(45000);
            expect(res.body.data[0].vehicle).toMatchObject({
                make: "Toyota",
                model: "Fortuner",
            });
        });

        it("only includes the requesting user's own purchases", async () => {
            const vehicle = await createVehicle({ quantity: 5 });
            const buyer = await authHeader(Role.CUSTOMER);
            const otherBuyer = await authHeader(Role.CUSTOMER);

            await request(app)
                .post(`/api/vehicles/${vehicle.id}/purchase`)
                .set(buyer.header);
            await request(app)
                .post(`/api/vehicles/${vehicle.id}/purchase`)
                .set(otherBuyer.header);

            const res = await request(app)
                .get("/api/users/me/purchases")
                .set(buyer.header);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it("keeps showing history for a vehicle that was later deleted", async () => {
            const vehicle = await createVehicle({ quantity: 1 });
            const buyer = await authHeader(Role.CUSTOMER);
            const admin = await authHeader(Role.ADMIN);

            await request(app)
                .post(`/api/vehicles/${vehicle.id}/purchase`)
                .set(buyer.header);
            await request(app)
                .delete(`/api/vehicles/${vehicle.id}`)
                .set(admin.header);

            const res = await request(app)
                .get("/api/users/me/purchases")
                .set(buyer.header);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].vehicle).toBeNull();
        });
    });
});
