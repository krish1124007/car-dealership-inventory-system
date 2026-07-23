import request from "supertest";
import { app } from "../../src/app.js";
import { useDb } from "../helpers/db.js";
import { authHeader } from "../helpers/auth.js";
import { Role } from "../../src/models/user.models.js";
import { ContactMessage } from "../../src/models/contact.models.js";

const ENDPOINT = "/api/contact";

const validMessage = {
    name: "Riya Sharma",
    email: "riya@example.com",
    subject: "Test drive for the Creta",
    message: "Can I book a test drive this weekend in Ahmedabad?",
};

describe(`POST ${ENDPOINT}`, () => {
    useDb();

    it("accepts a message from a visitor who is not logged in", async () => {
        const res = await request(app).post(ENDPOINT).send(validMessage);

        expect(res.status).toBe(201);
        await expect(ContactMessage.countDocuments()).resolves.toBe(1);
    });

    it("stores every field the visitor submitted", async () => {
        await request(app).post(ENDPOINT).send(validMessage);

        const stored = await ContactMessage.findOne();
        expect(stored).toMatchObject({
            name: validMessage.name,
            email: validMessage.email,
            subject: validMessage.subject,
            message: validMessage.message,
        });
    });

    it("treats the subject as optional", async () => {
        const { subject: _subject, ...withoutSubject } = validMessage;

        const res = await request(app).post(ENDPOINT).send(withoutSubject);

        expect(res.status).toBe(201);
    });

    it.each(["name", "email", "message"])(
        "rejects a submission missing %s with 400",
        async (field) => {
            const payload: Record<string, unknown> = { ...validMessage };
            delete payload[field];

            const res = await request(app).post(ENDPOINT).send(payload);

            expect(res.status).toBe(400);
            await expect(ContactMessage.countDocuments()).resolves.toBe(0);
        }
    );

    it("rejects a malformed email address with 400", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ ...validMessage, email: "not-an-email" });

        expect(res.status).toBe(400);
    });

    it("rejects an empty message with 400", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ ...validMessage, message: "   " });

        expect(res.status).toBe(400);
    });

    it("does not echo the stored message back to the public caller", async () => {
        const res = await request(app).post(ENDPOINT).send(validMessage);

        expect(res.status).toBe(201);
        expect(res.body.data).toBeNull();
    });
});

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

    it("lets an admin read what visitors have written", async () => {
        await request(app).post(ENDPOINT).send(validMessage);
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBe(1);
        expect(res.body.data.messages[0]).toMatchObject({
            name: validMessage.name,
            email: validMessage.email,
            message: validMessage.message,
        });
        expect(res.body.data.messages[0].createdAt).toEqual(expect.any(String));
    });

    it("returns the newest message first", async () => {
        await request(app)
            .post(ENDPOINT)
            .send({ ...validMessage, message: "First enquiry" });
        await request(app)
            .post(ENDPOINT)
            .send({ ...validMessage, message: "Second enquiry" });
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.body.data.messages[0].message).toBe("Second enquiry");
        expect(res.body.data.messages[1].message).toBe("First enquiry");
    });

    it("returns an empty inbox rather than failing when nobody has written", async () => {
        const { header } = await authHeader(Role.ADMIN);

        const res = await request(app).get(ENDPOINT).set(header);

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBe(0);
        expect(res.body.data.messages).toEqual([]);
    });
});
