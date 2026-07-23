import type { Request, Response } from "express";
import { z } from "zod";
import { ContactMessage } from "../models/contact.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Whitespace-only values are empty as far as a human reader is concerned,
// so trim before the length check.
const nonBlank = (max: number) =>
    z
        .string()
        .transform((value) => value.trim())
        .pipe(z.string().min(1).max(max));

const contactSchema = z.object({
    name: nonBlank(120),
    email: z.email(),
    subject: nonBlank(160).optional(),
    message: nonBlank(4000),
});

/** POST /api/contact — open to visitors, no account needed. */
const submitMessage = asyncHandler(async (req: Request, res: Response) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
        returnResponse(res, 400, "Invalid contact details", null);
        return;
    }

    const { subject, ...rest } = parsed.data;
    await ContactMessage.create({
        ...rest,
        ...(subject !== undefined && { subject }),
    });

    // Nothing is echoed back: the sender already knows what they wrote, and
    // the response is a receipt, not a record.
    returnResponse(res, 201, "Message sent", null);
});

/** GET /api/contact (admin) — the inbox, newest message first. */
const listMessages = asyncHandler(async (_req: Request, res: Response) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    returnResponse(res, 200, "Messages fetched", {
        total: messages.length,
        messages: messages.map((message) => message.toJSON()),
    });
});

export { submitMessage, listMessages };
