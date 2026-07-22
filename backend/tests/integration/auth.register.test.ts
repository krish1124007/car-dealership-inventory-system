import request from "supertest";
import bcrypt from "bcrypt";
import { app } from "../../src/app.js";
import { prisma, useDb } from "../helpers/db.js";

const ENDPOINT = "/api/auth/register";

const validBody = {
    name: "Krish",
    email: "krish@example.com",
    password: "Password123!",
};

describe(`POST ${ENDPOINT}`, () => {
    useDb();

    it("creates a user and returns 201 with the public profile", async () => {
        const res = await request(app).post(ENDPOINT).send(validBody);

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            name: validBody.name,
            email: validBody.email,
            role: "CUSTOMER",
        });
        expect(res.body.data.id).toEqual(expect.any(String));
    });

    it("never returns the password hash in the response", async () => {
        const res = await request(app).post(ENDPOINT).send(validBody);

        expect(res.body.data.passwordHash).toBeUndefined();
        expect(res.body.data.password).toBeUndefined();
    });

    it("stores the password as a bcrypt hash, not plaintext", async () => {
        await request(app).post(ENDPOINT).send(validBody);

        const user = await prisma.user.findUnique({
            where: { email: validBody.email },
        });
        expect(user).not.toBeNull();
        expect(user!.passwordHash).not.toBe(validBody.password);
        await expect(
            bcrypt.compare(validBody.password, user!.passwordHash)
        ).resolves.toBe(true);
    });

    it("registers new users as CUSTOMER, never ADMIN", async () => {
        // A client must not be able to self-assign the admin role.
        await request(app)
            .post(ENDPOINT)
            .send({ ...validBody, role: "ADMIN" });

        const user = await prisma.user.findUnique({
            where: { email: validBody.email },
        });
        expect(user!.role).toBe("CUSTOMER");
    });

    it("rejects a duplicate email with 409", async () => {
        await request(app).post(ENDPOINT).send(validBody);
        const res = await request(app).post(ENDPOINT).send(validBody);

        expect(res.status).toBe(409);
        await expect(prisma.user.count()).resolves.toBe(1);
    });

    it.each([
        ["name", { email: validBody.email, password: validBody.password }],
        ["email", { name: validBody.name, password: validBody.password }],
        ["password", { name: validBody.name, email: validBody.email }],
    ])("rejects a body missing %s with 400", async (_field, body) => {
        const res = await request(app).post(ENDPOINT).send(body);

        expect(res.status).toBe(400);
        await expect(prisma.user.count()).resolves.toBe(0);
    });

    it("rejects an invalid email format with 400", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ ...validBody, email: "not-an-email" });

        expect(res.status).toBe(400);
    });
});
