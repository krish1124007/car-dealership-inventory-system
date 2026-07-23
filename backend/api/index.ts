/**
 * Vercel serverless entry point.
 *
 * Locally the server boots via src/index.ts (`app.listen`); on Vercel every
 * request lands here instead. The Mongo connection and the default-admin
 * bootstrap run once per cold start and are reused across warm invocations
 * via the module-level promise.
 */
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { ensureDefaultAdmin } from "../src/utils/ensureAdmin.js";

let ready: Promise<void> | null = null;

function init(): Promise<void> {
    if (!ready) {
        ready = mongoose
            .connect(process.env.MONGODB_URI as string)
            .then(() => ensureDefaultAdmin())
            .catch((err) => {
                // Reset so the next invocation retries instead of caching
                // a permanently failed connection.
                ready = null;
                throw err;
            });
    }
    return ready;
}

export default async function handler(
    req: Request,
    res: Response
): Promise<void> {
    await init();
    app(req, res);
}
