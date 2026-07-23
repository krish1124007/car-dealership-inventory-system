import bcrypt from "bcryptjs";
import { useDb, User } from "../helpers/db.js";
import { createUser } from "../helpers/auth.js";
import { Role } from "../../src/models/user.models.js";
import { ensureDefaultAdmin } from "../../src/utils/ensureAdmin.js";

describe("ensureDefaultAdmin", () => {
    useDb();

    it("creates the default test admin when no admin exists", async () => {
        await ensureDefaultAdmin();

        const admin = await User.findOne({ role: Role.ADMIN });
        expect(admin).not.toBeNull();
        expect(admin!.email).toBe("admin@cardealership.com");
        // Stored hashed, and the documented password verifies against it.
        expect(admin!.passwordHash).not.toBe("Admin@123");
        await expect(
            bcrypt.compare("Admin@123", admin!.passwordHash)
        ).resolves.toBe(true);
    });

    it("still creates the default admin when a different admin exists, so the demo credentials always work", async () => {
        await createUser(Role.ADMIN);

        await ensureDefaultAdmin();

        const demo = await User.findOne({
            email: "admin@cardealership.com",
        });
        expect(demo).not.toBeNull();
        await expect(
            User.countDocuments({ role: Role.ADMIN })
        ).resolves.toBe(2);
    });

    it("is idempotent across repeated startups", async () => {
        await ensureDefaultAdmin();
        await ensureDefaultAdmin();

        await expect(
            User.countDocuments({ role: Role.ADMIN })
        ).resolves.toBe(1);
    });
});
