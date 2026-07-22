import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getMe, getMyPurchases } from "../controllers/user/user.auth.controller.js";

const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", getMe);
userRouter.get("/me/purchases", getMyPurchases);

export { userRouter };
