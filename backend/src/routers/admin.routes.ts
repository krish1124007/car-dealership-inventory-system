import { Router } from "express";
import { registerAdmin } from "../controllers/admin/admin.auth.controller.js";

const adminRouter = Router();

adminRouter.post("/register", registerAdmin);

export { adminRouter };
