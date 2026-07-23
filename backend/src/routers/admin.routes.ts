import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import { registerAdmin } from "../controllers/admin/admin.auth.controller.js";
import { listUsers } from "../controllers/admin/admin.users.controller.js";

const adminRouter = Router();

adminRouter.post("/register", registerAdmin);
adminRouter.get("/users", requireAuth, requireAdmin, listUsers);

export { adminRouter };
