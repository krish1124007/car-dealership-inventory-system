import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { createUser, DEFAULT_PASSWORD } from "../helpers/auth.js";
import { Role } from "../../src/generated/prisma/client.js";

const ENDPOINT = "/api/auth/login";

describe(`POST ${ENDPOINT}`, () => {
    useDb();

    it("returns 200 and an access token for valid credentials", async () => {
        const { user } = await createUser();

        const res = await request(app)
            .post(ENDPOINT)
            .send({ email: user.email, password: DEFAULT_PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toEqual(expect.any(String));
    });

    it("issues a JWT carrying the user id and role", async () => {
        const { user } = await createUser(Role.ADMIN);

        const res = await request(app)
            .post(ENDPOINT)
            .send({ email: user.email, password: DEFAULT_PASSWORD });

        const payload = jwt.verify(
            res.body.data.accessToken,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;
        expect(payload.sub).toBe(user.id);
        expect(payload.role).toBe("ADMIN");
    });

    it("rejects a wrong password with 401", async () => {
        const { user } = await createUser();

        const res = await request(app)
            .post(ENDPOINT)
            .send({ email: user.email, password: "wrong-password" });

        expect(res.status).toBe(401);
        expect(res.body.data?.accessToken).toBeUndefined();
    });

    it("rejects an unknown email with 401 (no user enumeration)", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ email: "nobody@example.com", password: DEFAULT_PASSWORD });

        expect(res.status).toBe(401);
    });

    it.each([
        ["email", { password: DEFAULT_PASSWORD }],
        ["password", { email: "someone@example.com" }],
    ])("rejects a body missing %s with 400", async (_field, body) => {
        const res = await request(app).post(ENDPOINT).send(body);

        expect(res.status).toBe(400);
    });
});
