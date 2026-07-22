import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../src/utils/asyncHandler.js";

const req = {} as Request;
const res = {} as Response;

describe("asyncHandler", () => {
    it("invokes the wrapped handler with req, res, and next", async () => {
        const handler = jest.fn(async () => {});
        const next = jest.fn() as NextFunction;

        asyncHandler(handler)(req, res, next);
        await Promise.resolve();

        expect(handler).toHaveBeenCalledWith(req, res, next);
    });

    it("does not call next when the handler resolves", async () => {
        const handler = jest.fn(async () => {});
        const next = jest.fn() as NextFunction;

        asyncHandler(handler)(req, res, next);
        await Promise.resolve();

        expect(next).not.toHaveBeenCalled();
    });

    it("forwards an async rejection to next", async () => {
        const boom = new Error("boom");
        const handler = jest.fn(async () => {
            throw boom;
        });
        const next = jest.fn() as NextFunction;

        asyncHandler(handler)(req, res, next);
        // Give the rejected promise's .catch a microtask to run.
        await new Promise(process.nextTick);

        expect(next).toHaveBeenCalledWith(boom);
    });
});
