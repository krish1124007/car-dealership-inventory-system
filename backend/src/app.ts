import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth.routes.js";
import { vehicleRouter } from "./routers/vehicle.routes.js";
import { adminRouter } from "./routers/admin.routes.js";
import { userRouter } from "./routers/user.routes.js";
import { uploadRouter } from "./routers/upload.routes.js";
import { contactRouter } from "./routers/contact.routes.js";
import { returnResponse } from "./utils/apiResponse.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/vehicles", vehicleRouter)
app.use("/api/admin", adminRouter)
app.use("/api/users", userRouter)
app.use("/api/uploads", uploadRouter)
app.use("/api/contact", contactRouter)

// Central error handler: anything forwarded by asyncHandler lands here.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    returnResponse(res, 500, "Internal Server Error", null);
})

export {app}
