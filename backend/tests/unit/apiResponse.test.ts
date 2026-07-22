import { jest } from "@jest/globals";
import type { Response } from "express";
import { returnResponse } from "../../src/utils/apiResponse.js";

function mockRes() {
    const res: Record<string, unknown> = {};
    res["status"] = jest.fn(() => res);
    res["json"] = jest.fn(() => res);
    return res as unknown as Response & {
        status: jest.Mock;
        json: jest.Mock;
    };
}

describe("returnResponse", () => {
    it("sets the HTTP status code", () => {
        const res = mockRes();

        returnResponse(res, 201, "created", { id: "abc" });

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("sends a { statusCode, message, data } envelope", () => {
        const res = mockRes();

        returnResponse(res, 200, "ok", [1, 2, 3]);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 200,
                message: "ok",
                data: [1, 2, 3],
            })
        );
    });

    it("passes null data through unchanged", () => {
        const res = mockRes();

        returnResponse(res, 404, "not found", null);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ statusCode: 404, data: null })
        );
    });
});
