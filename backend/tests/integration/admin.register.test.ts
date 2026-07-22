import request from "supertest";
import { app } from "../../src/app.js";
import { useDb, User } from "../helpers/db.js";
import { buildVehiclePayload } from "../helpers/factories.js";

const ENDPOINT = "/api/admin/register";

const validBody = {
    name: "Site Admin",
    email: "admin@example.com",
    password: "AdminPass123!",
};

// Set in tests/setup.ts; the endpoint must only work when this matches.
const SECRET = process.env.ADMIN_REGISTRATION_SECRET as string;

describe(`POST ${ENDPOINT}`, () => {
    useDb();

    it("creates an ADMIN user when the registration secret is correct", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(validBody);

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            name: validBody.name,
            email: validBody.email,
            role: "ADMIN",
        });

        const stored = await User.findOne({ email: validBody.email });
        expect(stored!.role).toBe("ADMIN");
    });

    it("never returns the password hash in the response", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(validBody);

        expect(res.body.data.passwordHash).toBeUndefined();
        expect(res.body.data.password).toBeUndefined();
    });

    it("rejects the request with 403 when the secret header is missing", async () => {
        const res = await request(app).post(ENDPOINT).send(validBody);

        expect(res.status).toBe(403);
        await expect(User.countDocuments()).resolves.toBe(0);
    });

    it("rejects the request with 403 when the secret is wrong", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", "not-the-secret")
            .send(validBody);

        expect(res.status).toBe(403);
        await expect(User.countDocuments()).resolves.toBe(0);
    });

    it.each([
        ["name", { email: validBody.email, password: validBody.password }],
        ["email", { name: validBody.name, password: validBody.password }],
        ["password", { name: validBody.name, email: validBody.email }],
    ])("rejects a body missing %s with 400", async (_field, body) => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(body);

        expect(res.status).toBe(400);
        await expect(User.countDocuments()).resolves.toBe(0);
    });

    it("rejects a duplicate email with 409", async () => {
        await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(validBody);
        const res = await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(validBody);

        expect(res.status).toBe(409);
        await expect(User.countDocuments()).resolves.toBe(1);
    });

    it("registered admins can log in and use admin-only endpoints", async () => {
        await request(app)
            .post(ENDPOINT)
            .set("x-admin-secret", SECRET)
            .send(validBody);

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: validBody.email, password: validBody.password });
        expect(loginRes.status).toBe(200);

        const createRes = await request(app)
            .post("/api/vehicles")
            .set("Authorization", `Bearer ${loginRes.body.data.accessToken}`)
            .send(buildVehiclePayload());
        expect(createRes.status).toBe(201);
    });
});
