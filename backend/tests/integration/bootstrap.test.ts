import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { useDb, User } from "../helpers/db.js";
import { createUser } from "../helpers/auth.js";
import { Role } from "../../src/models/user.models.js";
import { ensureDemoAccounts } from "../../src/utils/ensureDemoAccounts.js";

describe("ensureDemoAccounts", () => {
    useDb();

    it("creates the demo admin so the documented credentials always work", async () => {
        await ensureDemoAccounts();

        const admin = await User.findOne({ role: Role.ADMIN });
        expect(admin).not.toBeNull();
        expect(admin!.email).toBe("admin@cardealership.com");
        // Stored hashed, and the documented password verifies against it.
        expect(admin!.passwordHash).not.toBe("Admin@123");
        await expect(
            bcrypt.compare("Admin@123", admin!.passwordHash)
        ).resolves.toBe(true);
    });

    it("creates the demo customer as well", async () => {
        await ensureDemoAccounts();

        const customer = await User.findOne({
            email: "user@cardealership.com",
        });
        expect(customer).not.toBeNull();
        expect(customer!.role).toBe(Role.CUSTOMER);
        await expect(
            bcrypt.compare("User@123", customer!.passwordHash)
        ).resolves.toBe(true);
    });

    it("still creates the demo admin when a different admin exists", async () => {
        await createUser(Role.ADMIN);

        await ensureDemoAccounts();

        const demo = await User.findOne({ email: "admin@cardealership.com" });
        expect(demo).not.toBeNull();
        await expect(User.countDocuments({ role: Role.ADMIN })).resolves.toBe(2);
    });

    it("is idempotent across repeated startups", async () => {
        await ensureDemoAccounts();
        await ensureDemoAccounts();

        await expect(User.countDocuments()).resolves.toBe(2);
    });

    it("lets both demo accounts sign in through the real login endpoint", async () => {
        await ensureDemoAccounts();

        const admin = await request(app).post("/api/auth/login").send({
            email: "admin@cardealership.com",
            password: "Admin@123",
        });
        const customer = await request(app).post("/api/auth/login").send({
            email: "user@cardealership.com",
            password: "User@123",
        });

        expect(admin.status).toBe(200);
        expect(admin.body.data.user.role).toBe(Role.ADMIN);
        expect(customer.status).toBe(200);
        expect(customer.body.data.user.role).toBe(Role.CUSTOMER);
    });
});

describe("admin accounts cannot be created through the API", () => {
    useDb();

    it("has no admin registration endpoint at all", async () => {
        const res = await request(app).post("/api/admin/register").send({
            name: "Sneaky Admin",
            email: "sneaky@example.com",
            password: "Password123!",
        });

        expect(res.status).toBe(404);
        await expect(User.countDocuments()).resolves.toBe(0);
    });

    it("ignores a client-supplied ADMIN role on public registration", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Sneaky",
            email: "sneaky@example.com",
            password: "Password123!",
            role: Role.ADMIN,
        });

        expect(res.status).toBe(201);
        const created = await User.findOne({ email: "sneaky@example.com" });
        expect(created!.role).toBe(Role.CUSTOMER);
        await expect(User.countDocuments({ role: Role.ADMIN })).resolves.toBe(0);
    });
});
