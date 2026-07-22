import request from "supertest";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { createVehicle } from "../helpers/factories.js";
import { Role } from "../../src/models/user.models.js";

const ENDPOINT = "/api/vehicles/search";

describe(`GET ${ENDPOINT}`, () => {
    useDb();

    async function seedInventory() {
        await createVehicle({ make: "Toyota", model: "Corolla", category: "Sedan", price: 20000 });
        await createVehicle({ make: "Toyota", model: "Fortuner", category: "SUV", price: 45000 });
        await createVehicle({ make: "Honda", model: "City", category: "Sedan", price: 18000 });
        await createVehicle({ make: "Tesla", model: "Model Y", category: "SUV", price: 60000 });
    }

    it("rejects unauthenticated requests with 401", async () => {
        const res = await request(app).get(ENDPOINT).query({ make: "Toyota" });

        expect(res.status).toBe(401);
    });

    it("filters by make", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ make: "Toyota" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(
            res.body.data.every((v: { make: string }) => v.make === "Toyota")
        ).toBe(true);
    });

    it("matches make case-insensitively", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ make: "toyota" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });

    it("filters by model", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ model: "City" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].model).toBe("City");
    });

    it("filters by category", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ category: "SUV" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });

    it("searches make and model together with q", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const byModel = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ q: "corolla" });
        const byMake = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ q: "Toyota" });
        const partial = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ q: "fort" });

        expect(byModel.status).toBe(200);
        expect(byModel.body.data).toHaveLength(1);
        expect(byModel.body.data[0].model).toBe("Corolla");
        expect(byMake.body.data).toHaveLength(2);
        expect(partial.body.data).toHaveLength(1);
        expect(partial.body.data[0].model).toBe("Fortuner");
    });

    it("filters by price range (minPrice and maxPrice)", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ minPrice: 19000, maxPrice: 50000 });

        expect(res.status).toBe(200);
        const prices = res.body.data.map((v: { price: string }) =>
            Number(v.price)
        );
        expect(prices).toHaveLength(2); // Corolla 20000 and Fortuner 45000
        expect(prices.every((p: number) => p >= 19000 && p <= 50000)).toBe(true);
    });

    it("supports minPrice alone as an open-ended range", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ minPrice: 44000 });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2); // Fortuner and Model Y
    });

    it("combines multiple filters with AND semantics", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ make: "Toyota", category: "SUV" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].model).toBe("Fortuner");
    });

    it("returns 200 with an empty list when nothing matches", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ make: "Ferrari" });

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it("rejects a non-numeric price filter with 400", async () => {
        await seedInventory();
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app)
            .get(ENDPOINT)
            .set(header)
            .query({ minPrice: "cheap" });

        expect(res.status).toBe(400);
    });
});
