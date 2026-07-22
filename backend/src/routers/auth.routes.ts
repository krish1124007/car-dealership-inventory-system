import { Router } from "express";
import { register, loginHandler } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", loginHandler);

export { authRouter };
