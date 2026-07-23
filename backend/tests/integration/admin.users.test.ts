import request from "supertest";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { Role, User } from "../../src/models/user.models.js";

const ENDPOINT = "/api/admin/users";

describe(`GET ${ENDPOINT}`, () => {
    useDb();

    it("rejects unauthenticated requests with 401", async () => {
        const res = await request(app).get(ENDPOINT);

        expect(res.status).toBe(401);
    });

    it("rejects customers with 403 — admin only", async () => {
        const { header } = await authHeader(Role.CUSTOMER);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.status).toBe(403);
    });

    it("returns every registered user with a total count", async () => {
        const { header } = await authHeader(Role.ADMIN);
        await authHeader(Role.CUSTOMER);
        await authHeader(Role.CUSTOMER);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBe(3);
        expect(res.body.data.users).toHaveLength(3);
    });

    it("never leaks password hashes", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.status).toBe(200);
        for (const user of res.body.data.users) {
            expect(user.passwordHash).toBeUndefined();
        }
        expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
    });

    it("reports each user's role and join date", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).get(ENDPOINT).set(header);

        const admin = res.body.data.users.find(
            (u: { role: string }) => u.role === Role.ADMIN
        );
        expect(admin).toBeDefined();
        expect(admin.email).toEqual(expect.any(String));
        expect(admin.createdAt).toEqual(expect.any(String));
    });

    it("shows no last-login time for a user who has never logged in", async () => {
        const { header } = await authHeader(Role.ADMIN);
        await User.create({
            name: "Never Logged In",
            email: "never@example.com",
            passwordHash: "irrelevant",
            role: Role.CUSTOMER,
        });

        const res = await request(app).get(ENDPOINT).set(header);

        const never = res.body.data.users.find(
            (u: { email: string }) => u.email === "never@example.com"
        );
        expect(never).toBeDefined();
        expect(never.lastLoginAt ?? null).toBeNull();
    });

    it("records the last-login time when a user logs in", async () => {
        const { header } = await authHeader(Role.ADMIN);
        const password = "Password123!";
        await request(app).post("/api/auth/register").send({
            name: "Logger",
            email: "logger@example.com",
            password,
        });

        const before = await request(app).get(ENDPOINT).set(header);
        const beforeEntry = before.body.data.users.find(
            (u: { email: string }) => u.email === "logger@example.com"
        );
        expect(beforeEntry.lastLoginAt ?? null).toBeNull();

        await request(app)
            .post("/api/auth/login")
            .send({ email: "logger@example.com", password });

        const after = await request(app).get(ENDPOINT).set(header);
        const afterEntry = after.body.data.users.find(
            (u: { email: string }) => u.email === "logger@example.com"
        );
        expect(afterEntry.lastLoginAt).toEqual(expect.any(String));
        expect(Number.isNaN(Date.parse(afterEntry.lastLoginAt))).toBe(false);
    });

    it("does not stamp a last-login time when the password is wrong", async () => {
        const { header } = await authHeader(Role.ADMIN);
        await request(app).post("/api/auth/register").send({
            name: "Careful",
            email: "careful@example.com",
            password: "Password123!",
        });

        await request(app)
            .post("/api/auth/login")
            .send({ email: "careful@example.com", password: "wrong-password" });

        const res = await request(app).get(ENDPOINT).set(header);
        const entry = res.body.data.users.find(
            (u: { email: string }) => u.email === "careful@example.com"
        );
        expect(entry.lastLoginAt ?? null).toBeNull();
    });
});
