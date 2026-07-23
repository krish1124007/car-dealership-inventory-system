import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import { listUsers } from "../controllers/admin/admin.users.controller.js";

const adminRouter = Router();

// There is deliberately no admin-registration route: admin accounts are
// only ever created by the server itself (see utils/ensureDemoAccounts.ts),
// so no request can ever mint one.
adminRouter.get("/users", requireAuth, requireAdmin, listUsers);

export { adminRouter };
