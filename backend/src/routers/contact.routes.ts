import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
    submitMessage,
    listMessages,
} from "../controllers/contact.controller.js";

const contactRouter = Router();

// Anyone can write in; only an admin can read the inbox.
contactRouter.post("/", submitMessage);
contactRouter.get("/", requireAuth, requireAdmin, listMessages);

export { contactRouter };
